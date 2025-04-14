const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Property = require('../models/Property');
const Developer = require('../models/Developer');
const Investment = require('../models/Investment');
const { hashPassword } = require('./passwordUtils');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reva', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const createSampleData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Property.deleteMany();
    await Developer.deleteMany();
    await Investment.deleteMany();

    console.log('Data cleared from database...');

    // Create admin user
    const adminPassword = await hashPassword('adminpassword');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@reva.com',
      phone: '+2348012345678',
      password: adminPassword,
      isAdmin: true,
      isKYCApproved: true
    });

    console.log('Admin user created');

    // Create regular users
    const password = await hashPassword('password123');
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348055555555',
        password,
        isKYCApproved: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+2348066666666',
        password,
        isKYCApproved: true
      },
      {
        name: 'Ade Johnson',
        email: 'ade@example.com',
        phone: '+2348077777777',
        password,
        isKYCApproved: false
      },
      {
        name: 'Blessing Okafor',
        email: 'blessing@example.com',
        phone: '+2348088888888',
        password,
        isKYCApproved: false
      }
    ]);

    console.log('Sample users created');

    // Create developers
    const developers = await Developer.insertMany([
      {
        name: 'Landmark Developers',
        email: 'info@landmark.com',
        phone: '+2348099999999',
        website: 'https://landmark.com',
        description: 'Premier real estate developer in Lagos with over 15 years of experience.',
        completedProjects: 25,
        establishedYear: 2008
      },
      {
        name: 'Abuja Heights Construction',
        email: 'contact@abujaheights.com',
        phone: '+2347011111111',
        website: 'https://abujaheights.com',
        description: 'Specializing in luxury apartments and commercial spaces in Abuja.',
        completedProjects: 12,
        establishedYear: 2015
      }
    ]);

    console.log('Sample developers created');

    // Create properties
    const properties = await Property.insertMany([
      {
        name: 'Luxury Apartment in Lekki',
        description: 'Beautiful 3-bedroom apartment in the heart of Lekki Phase 1, with modern facilities and 24/7 security.',
        location: 'Lekki Phase 1, Lagos',
        type: 'Residential',
        price: 75000000,
        size: 150,
        roi: 12,
        minimumInvestment: 100000,
        developer: developers[0]._id,
        images: ['lekki_apartment_1.jpg', 'lekki_apartment_2.jpg'],
        amenities: ['Swimming Pool', 'Gym', 'Security', 'Power Backup'],
        status: 'Available',
        fundingProgress: 65,
        riskLevel: 'Low',
        term: 5
      },
      {
        name: 'Commercial Office Space in Victoria Island',
        description: 'Prime office space in a Grade A building in Victoria Island, ideal for businesses looking for prestige and accessibility.',
        location: 'Victoria Island, Lagos',
        type: 'Commercial',
        price: 150000000,
        size: 300,
        roi: 15,
        minimumInvestment: 250000,
        developer: developers[0]._id,
        images: ['vi_office_1.jpg', 'vi_office_2.jpg'],
        amenities: ['Parking Space', 'Cafeteria', 'Conference Room', 'High-speed Internet'],
        status: 'Available',
        fundingProgress: 40,
        riskLevel: 'Medium',
        term: 7
      },
      {
        name: 'Residential Land in Abuja',
        description: 'Large plot of land in a developing area of Abuja, perfect for building a family home or for investment purposes.',
        location: 'Guzape, Abuja',
        type: 'Land',
        price: 50000000,
        size: 500,
        roi: 20,
        minimumInvestment: 100000,
        developer: developers[1]._id,
        images: ['abuja_land_1.jpg', 'abuja_land_2.jpg'],
        amenities: ['Good Access Road', 'Proximity to Schools', 'Security'],
        status: 'Available',
        fundingProgress: 25,
        riskLevel: 'Medium',
        term: 3
      },
      {
        name: 'Warehouse in Apapa',
        description: 'Spacious warehouse in Apapa, close to the port, ideal for import-export businesses or storage.',
        location: 'Apapa, Lagos',
        type: 'Industrial',
        price: 200000000,
        size: 1000,
        roi: 18,
        minimumInvestment: 500000,
        developer: developers[0]._id,
        images: ['apapa_warehouse_1.jpg', 'apapa_warehouse_2.jpg'],
        amenities: ['Loading Bay', 'Security', 'Power Backup', 'Office Space'],
        status: 'Available',
        fundingProgress: 10,
        riskLevel: 'High',
        term: 10
      }
    ]);

    console.log('Sample properties created');

    // Create investments
    await Investment.insertMany([
      {
        user: users[0]._id,
        property: properties[0]._id,
        amount: 500000,
        units: 5,
        status: 'Active',
        returns: 60000,
        startDate: new Date('2023-01-01'),
        maturityDate: new Date('2028-01-01')
      },
      {
        user: users[1]._id,
        property: properties[0]._id,
        amount: 1000000,
        units: 10,
        status: 'Active',
        returns: 120000,
        startDate: new Date('2023-02-15'),
        maturityDate: new Date('2028-02-15')
      },
      {
        user: users[0]._id,
        property: properties[2]._id,
        amount: 300000,
        units: 3,
        status: 'Active',
        returns: 60000,
        startDate: new Date('2023-03-10'),
        maturityDate: new Date('2026-03-10')
      }
    ]);

    console.log('Sample investments created');

    console.log('Sample data created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
createSampleData();