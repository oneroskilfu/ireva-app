const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Developer = require('../models/Developer');
const Project = require('../models/Project');
const { hashPassword } = require('./passwordUtils');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Admin user data
const adminUserData = {
  name: 'Admin User',
  email: 'admin@reva.com',
  password: 'adminpassword',
  isAdmin: true,
  isKYCApproved: true,
  walletBalance: 0
};

// Sample property data
const propertiesData = [
  {
    name: 'Premium Abuja Land',
    location: 'Abuja, Nigeria',
    type: 'land',
    price: 50000000,
    size: '2 Acres',
    description: 'Prime land for development in the heart of Abuja.',
    imageUrl: 'https://example.com/images/abuja-land.jpg',
    features: ['Strategic Location', 'Road Access', 'Clean Title'],
    targetReturn: 15,
    riskRating: 'Medium'
  },
  {
    name: 'Lagos Luxury Apartment Complex',
    location: 'Ikoyi, Lagos, Nigeria',
    type: 'residential',
    price: 750000000,
    size: '5000 sqm',
    description: 'Luxury apartment complex with 20 units in prime Ikoyi location.',
    imageUrl: 'https://example.com/images/lagos-apartments.jpg',
    features: ['Swimming Pool', '24/7 Security', 'Backup Power', 'Gym'],
    targetReturn: 18,
    riskRating: 'Low'
  },
  {
    name: 'Lekki Shopping Mall',
    location: 'Lekki, Lagos, Nigeria',
    type: 'commercial',
    price: 1250000000,
    size: '10000 sqm',
    description: 'Modern shopping mall with premium retail spaces in the growing Lekki area.',
    imageUrl: 'https://example.com/images/lekki-mall.jpg',
    features: ['High Foot Traffic', 'Ample Parking', 'Modern Design'],
    targetReturn: 20,
    riskRating: 'Medium'
  }
];

// Sample developer data
const developersData = [
  {
    name: 'REVA Developers Limited',
    description: 'Premier real estate development company focused on quality and innovation.',
    logoUrl: 'https://example.com/images/reva-developers-logo.jpg',
    website: 'https://reva-developers.com',
    contactEmail: 'info@reva-developers.com',
    contactPhone: '+234 800 123 4567',
    address: '123 Victoria Island, Lagos, Nigeria',
    establishedYear: 2010,
    completedProjects: 25,
    rating: 4.8,
    verified: true
  },
  {
    name: 'NigerBuild Construction',
    description: 'Specialized in commercial and residential developments across Nigeria.',
    logoUrl: 'https://example.com/images/nigerbuild-logo.jpg',
    website: 'https://nigerbuild.com',
    contactEmail: 'info@nigerbuild.com',
    contactPhone: '+234 800 987 6543',
    address: '45 Maitama, Abuja, Nigeria',
    establishedYear: 2005,
    completedProjects: 42,
    rating: 4.5,
    verified: true
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Developer.deleteMany({});
    await Project.deleteMany({});
    
    console.log('Data cleared');
    
    // Create admin user
    const hashedPassword = await hashPassword(adminUserData.password);
    const adminUser = await User.create({
      ...adminUserData,
      password: hashedPassword
    });
    
    console.log('Admin user created:', adminUser.email);
    
    // Create properties
    const properties = await Property.insertMany(propertiesData);
    console.log(`${properties.length} properties created`);
    
    // Create developers
    const developers = await Developer.insertMany(developersData);
    console.log(`${developers.length} developers created`);
    
    // Create projects
    const projectsData = [
      {
        name: 'Abuja Land Development',
        description: 'Development of premium land into residential plots in Abuja.',
        property: properties[0]._id,
        developer: developers[0]._id,
        totalFunding: 100000000,
        currentFunding: 25000000,
        targetReturn: 15,
        term: 60, // 5 years in months
        minInvestment: 100000,
        status: 'funding',
        startDate: new Date('2025-05-01'),
        estimatedCompletionDate: new Date('2030-05-01')
      },
      {
        name: 'Lagos Luxury Apartments',
        description: 'Construction of luxury apartments in Ikoyi, Lagos.',
        property: properties[1]._id,
        developer: developers[0]._id,
        totalFunding: 950000000,
        currentFunding: 350000000,
        targetReturn: 18,
        term: 60, // 5 years in months
        minInvestment: 250000,
        status: 'construction',
        startDate: new Date('2025-02-15'),
        estimatedCompletionDate: new Date('2028-02-15')
      },
      {
        name: 'Lekki Mall Development',
        description: 'Development of a modern shopping mall in Lekki.',
        property: properties[2]._id,
        developer: developers[1]._id,
        totalFunding: 1500000000,
        currentFunding: 500000000,
        targetReturn: 20,
        term: 60, // 5 years in months
        minInvestment: 500000,
        status: 'planning',
        startDate: new Date('2025-08-01'),
        estimatedCompletionDate: new Date('2030-08-01')
      }
    ];
    
    const projects = await Project.insertMany(projectsData);
    console.log(`${projects.length} projects created`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();