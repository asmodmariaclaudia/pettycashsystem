// scripts/initializeAdmin.js
const db = require('../models'); // Adjust the path as necessary
const sequelize = db.sequelize; // Reference to the sequelize instance

const createAdmin = async () => {
    try {
        const admin = await db.User.create({ // Use db.User to access the User model
            username: 'admin1',
            password: 'admin123', // Just use the plaintext password; it will be hashed in the hook
            userType: 'admin', // Specify that this user is an admin
        });
        console.log('Admin created:', admin);
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

const initializeAdmin = async () => {
    try {
        await sequelize.sync({ force: true }); // WARNING: This will drop existing tables
        await createAdmin(); // Call the function to create an admin user
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
};

// Call the initializeAdmin function to run the script
initializeAdmin();
