import { db } from '../db';
import { investments, properties, users } from '@shared/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { sendMaturityNotification } from './emailService';
import { sendNotification } from './notificationService';
import { format } from 'date-fns';

/**
 * Checks for investments that have reached maturity and updates their status
 */
export const checkMaturedInvestments = async () => {
  try {
    console.log('Checking for matured investments...');
    
    // Find active investments that have reached maturity date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const maturedInvestments = await db
      .select({
        id: investments.id,
        userId: investments.userId,
        propertyId: investments.propertyId,
        amount: investments.amount,
        projectedROI: investments.projectedROI,
        maturityDate: investments.maturityDate
      })
      .from(investments)
      .where(
        and(
          eq(investments.status, 'active'),
          lte(investments.maturityDate, today)
        )
      );
    
    console.log(`Found ${maturedInvestments.length} investments that have reached maturity`);
    
    // Update each investment to 'matured' status
    for (const investment of maturedInvestments) {
      // Update investment status
      await db
        .update(investments)
        .set({
          status: 'matured',
          updatedAt: new Date()
        })
        .where(eq(investments.id, investment.id));
      
      // Get property details for notification
      const [property] = await db
        .select({
          name: properties.name
        })
        .from(properties)
        .where(eq(properties.id, parseInt(investment.propertyId)));
      
      if (!property) {
        console.error(`Property not found for ID: ${investment.propertyId}`);
        continue;
      }
      
      // Get user details for notification
      const [user] = await db
        .select({
          email: users.email,
          username: users.username
        })
        .from(users)
        .where(eq(users.id, investment.userId));
      
      if (!user) {
        console.error(`User not found for ID: ${investment.userId}`);
        continue;
      }
      
      // Create in-app notification
      await sendNotification({
        userId: investment.userId,
        type: 'investment-matured',
        title: 'Investment Matured',
        message: `Your investment in ${property.name} has reached maturity. Please check your investment dashboard for details.`,
        link: `/investments/${investment.id}`
      });
      
      // Send email notification if email is available
      if (user.email) {
        await sendMaturityNotification(
          user.email,
          property.name,
          investment.amount,
          investment.maturityDate ? format(investment.maturityDate, 'MMMM dd, yyyy') : 'N/A',
          investment.id
        );
      }
      
      console.log(`Updated investment ${investment.id} to matured status and sent notifications`);
    }
    
    return maturedInvestments.length;
  } catch (error) {
    console.error('Error checking for matured investments:', error);
    return 0;
  }
};

/**
 * Initialize portfolio monitoring tasks
 */
export const initializePortfolioMonitoring = () => {
  // Schedule daily maturity check (9 AM every day)
  const scheduleDaily = () => {
    const now = new Date();
    const targetHour = 9; // 9 AM
    
    // Calculate time until 9 AM
    let targetTime = new Date(now);
    targetTime.setHours(targetHour, 0, 0, 0);
    
    // If it's already past 9 AM, schedule for tomorrow
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilTarget = targetTime.getTime() - now.getTime();
    
    // Schedule the check
    setTimeout(() => {
      // Run the check
      checkMaturedInvestments()
        .then(count => console.log(`Maturity check complete: ${count} investments updated`))
        .catch(error => console.error('Error in scheduled maturity check:', error))
        .finally(() => {
          // Schedule the next check
          scheduleDaily();
        });
    }, timeUntilTarget);
    
    console.log(`Portfolio monitoring scheduled for ${targetTime.toLocaleString()}`);
  };
  
  // Start the scheduling
  scheduleDaily();
  
  // Also run an immediate check during startup
  setTimeout(() => {
    checkMaturedInvestments()
      .then(count => console.log(`Initial maturity check complete: ${count} investments updated`))
      .catch(error => console.error('Error in initial maturity check:', error));
  }, 30000); // Wait 30 seconds after startup
  
  console.log('Portfolio monitoring service initialized');
};