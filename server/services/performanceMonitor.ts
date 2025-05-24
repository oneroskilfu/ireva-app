import { db } from '../db';
import { investments, properties, users } from '@shared/schema';
import { eq, and, lt, sql } from 'drizzle-orm';
import { sendAdminEmail } from './emailService';
import { sendNotification } from './notificationService';

interface PerformanceAlert {
  investmentId: string;
  propertyId: string;
  userId: string;
  projectedROI: string;
  actualROI: string | null;
  variance: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Triggers an alert to administrators about underperforming investments
 */
const alertAdminsAboutPerformanceIssue = async (alert: PerformanceAlert) => {
  try {
    // Find admin users
    const admins = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.role, 'admin'));
    
    if (!admins.length) {
      console.log('No admin users found to send alerts to');
      return;
    }
    
    // Get property details
    const [property] = await db
      .select({
        name: properties.name
      })
      .from(properties)
      .where(eq(properties.id, parseInt(alert.propertyId)));
    
    if (!property) {
      console.error(`Property not found for ID: ${alert.propertyId}`);
      return;
    }
    
    // Get user details
    const [investor] = await db
      .select({
        username: users.username,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, alert.userId));
    
    if (!investor) {
      console.error(`Investor not found for ID: ${alert.userId}`);
      return;
    }
    
    // Format variance as a percentage
    const variancePercent = (alert.variance * 100).toFixed(2);
    
    // Create an alert notification for each admin
    for (const admin of admins) {
      // Create in-app notification
      await sendNotification({
        userId: admin.id,
        type: 'performance-alert',
        title: `${alert.severity.toUpperCase()} Performance Alert: ${property.name}`,
        message: `Investment ${alert.investmentId} is underperforming by ${variancePercent}%. Projected ROI: ${alert.projectedROI}%, Actual ROI: ${alert.actualROI || 'N/A'}%`,
        link: `/admin/investments/${alert.investmentId}`,
        metadata: JSON.stringify(alert)
      });
      
      // Send email alert if email is available
      if (admin.email) {
        const emailSubject = `${alert.severity.toUpperCase()} Performance Alert: ${property.name}`;
        const emailBody = `
          A performance alert has been triggered for property "${property.name}".
          
          Investment ID: ${alert.investmentId}
          Investor: ${investor.username} (${investor.email})
          Severity: ${alert.severity.toUpperCase()}
          
          Projected ROI: ${alert.projectedROI}%
          Actual ROI: ${alert.actualROI || 'N/A'}%
          Variance: ${variancePercent}% below projection
          
          Please review this investment in the admin portal.
        `;
        
        await sendAdminEmail(admin.email, emailSubject, emailBody);
      }
    }
    
    console.log(`Performance alert sent to ${admins.length} admins for investment ${alert.investmentId}`);
  } catch (error) {
    console.error('Error sending performance alerts to admins:', error);
  }
};

/**
 * Checks for investments with ROI performance below thresholds
 * - Minor: actual < projected - 5%
 * - Moderate: actual < projected - 10%
 * - Severe: actual < projected - 15%
 */
export const checkPerformanceThresholds = async () => {
  try {
    console.log('Checking investment performance thresholds...');
    
    // Get all active investments with actualROI data
    const investmentsWithROI = await db
      .select({
        id: investments.id,
        userId: investments.userId,
        propertyId: investments.propertyId,
        projectedROI: investments.projectedROI,
        actualROI: investments.actualROI
      })
      .from(investments)
      .where(
        and(
          eq(investments.status, 'active'),
          sql`${investments.actualROI} IS NOT NULL`
        )
      );
    
    console.log(`Found ${investmentsWithROI.length} investments with actualROI data`);
    
    // Track alerts to avoid duplicate notifications
    const alerts: PerformanceAlert[] = [];
    
    // Check each investment against performance thresholds
    for (const investment of investmentsWithROI) {
      if (!investment.actualROI) continue;
      
      const projectedROI = parseFloat(investment.projectedROI);
      const actualROI = parseFloat(investment.actualROI);
      
      // Skip if actualROI is higher than or equal to projection
      if (actualROI >= projectedROI) continue;
      
      // Calculate variance (how much below projection)
      const variance = (projectedROI - actualROI) / projectedROI;
      
      // Determine severity based on variance
      let severity: 'low' | 'medium' | 'high' = 'low';
      
      if (variance >= 0.15) {
        severity = 'high';
      } else if (variance >= 0.10) {
        severity = 'medium';
      } else if (variance >= 0.05) {
        severity = 'low';
      } else {
        // Variance below threshold, no alert needed
        continue;
      }
      
      // Create alert
      alerts.push({
        investmentId: investment.id,
        propertyId: investment.propertyId,
        userId: investment.userId,
        projectedROI: investment.projectedROI,
        actualROI: investment.actualROI,
        variance,
        severity
      });
    }
    
    // Send alerts for each underperforming investment
    console.log(`Sending alerts for ${alerts.length} underperforming investments`);
    
    for (const alert of alerts) {
      await alertAdminsAboutPerformanceIssue(alert);
    }
    
    return alerts;
  } catch (error) {
    console.error('Error checking performance thresholds:', error);
    return [];
  }
};

/**
 * Check for properties with consistently underperforming investments
 * This helps identify systemic issues with specific properties
 */
export const identifyProblemProperties = async () => {
  try {
    console.log('Identifying properties with systemic performance issues...');
    
    // Get all properties with their investments
    const propertiesWithInvestments = await db
      .select({
        id: properties.id,
        name: properties.name,
        investmentCount: sql<number>`COUNT(${investments.id})`,
        underperformingCount: sql<number>`SUM(CASE WHEN CAST(${investments.actualROI} AS DECIMAL) < CAST(${investments.projectedROI} AS DECIMAL) * 0.9 THEN 1 ELSE 0 END)`
      })
      .from(properties)
      .leftJoin(investments, eq(properties.id, sql<number>`CAST(${investments.propertyId} AS INTEGER)`))
      .where(sql`${investments.actualROI} IS NOT NULL`)
      .groupBy(properties.id, properties.name)
      .having(sql`COUNT(${investments.id}) >= 5`); // Only consider properties with at least 5 investments
    
    // Identify properties where >50% of investments are underperforming
    const problemProperties = propertiesWithInvestments.filter(property => {
      const underperformingPercentage = property.underperformingCount / property.investmentCount;
      return underperformingPercentage > 0.5;
    });
    
    console.log(`Found ${problemProperties.length} properties with systemic performance issues`);
    
    // Alert admins about problem properties
    for (const property of problemProperties) {
      // Find admin users
      const admins = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.role, 'admin'));
      
      for (const admin of admins) {
        // Create notification
        await sendNotification({
          userId: admin.id,
          type: 'property-performance-alert',
          title: `Property Performance Alert: ${property.name}`,
          message: `Property ID ${property.id} has ${property.underperformingCount} out of ${property.investmentCount} investments underperforming. This may indicate a systemic issue.`,
          link: `/admin/properties/${property.id}`
        });
        
        // Send email if available
        if (admin.email) {
          const emailSubject = `Property Performance Alert: ${property.name}`;
          const emailBody = `
            A systemic performance issue has been identified with property "${property.name}" (ID: ${property.id}).
            
            Out of ${property.investmentCount} investments, ${property.underperformingCount} (${((property.underperformingCount / property.investmentCount) * 100).toFixed(1)}%) are significantly underperforming.
            
            This may indicate a fundamental problem with this property's ROI projections or management.
            
            Please review this property in the admin portal.
          `;
          
          await sendAdminEmail(admin.email, emailSubject, emailBody);
        }
      }
    }
    
    return problemProperties;
  } catch (error) {
    console.error('Error identifying problem properties:', error);
    return [];
  }
};

/**
 * Initialize all performance monitoring services
 */
export const initializePerformanceMonitoring = () => {
  // Schedule daily performance check (8 AM every day)
  const scheduleDaily = () => {
    const now = new Date();
    const targetHour = 8; // 8 AM
    
    // Calculate time until 8 AM
    let targetTime = new Date(now);
    targetTime.setHours(targetHour, 0, 0, 0);
    
    // If it's already past 8 AM, schedule for tomorrow
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilTarget = targetTime.getTime() - now.getTime();
    
    // Schedule the check
    setTimeout(() => {
      // Run the check
      checkPerformanceThresholds()
        .then(() => identifyProblemProperties())
        .catch(error => console.error('Error in scheduled performance monitoring:', error))
        .finally(() => {
          // Schedule the next check
          scheduleDaily();
        });
    }, timeUntilTarget);
    
    console.log(`Performance monitoring scheduled for ${targetTime.toLocaleString()}`);
  };
  
  // Start the scheduling
  scheduleDaily();
  
  // Also run an immediate check
  setTimeout(() => {
    checkPerformanceThresholds()
      .then(() => identifyProblemProperties())
      .catch(error => console.error('Error in initial performance monitoring:', error));
  }, 60000); // Wait 1 minute after startup
  
  console.log('Performance monitoring service initialized');
};