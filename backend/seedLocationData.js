const mongoose = require('mongoose');
const dotenv = require('dotenv');
const District = require('./models/District');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

dotenv.config();

const districtsData = [
    { name: "Hyderabad", state: "Telangana" },
    { name: "Warangal", state: "Telangana" },
    { name: "Karimnagar", state: "Telangana" },
    { name: "Nizamabad", state: "Telangana" },
    { name: "Khammam", state: "Telangana" },
    { name: "Mahbubnagar", state: "Telangana" },
    { name: "Rangareddy", state: "Telangana" },
    { name: "Sangareddy", state: "Telangana" },
    { name: "Visakhapatnam", state: "Andhra Pradesh" },
    { name: "Vijayawada", state: "Andhra Pradesh" },
    { name: "Guntur", state: "Andhra Pradesh" },
    { name: "Nellore", state: "Andhra Pradesh" },
    { name: "Kurnool", state: "Andhra Pradesh" },
    { name: "Tirupati", state: "Andhra Pradesh" },
    { name: "Anantapur", state: "Andhra Pradesh" },
    { name: "Rajahmundry", state: "Andhra Pradesh" },
    { name: "Kadapa", state: "Andhra Pradesh" }
];

const hospitalNamesMap = {
    "Hyderabad": ["Apollo Hospitals", "Yashoda Hospitals", "Care Hospitals", "KIMS Hospitals", "AIG Hospitals", "Sunshine Hospitals", "Star Hospitals", "Continental Hospitals", "Rainbow Children's Hospital", "Medicover Hospitals"],
    "Vijayawada": ["Manipal Hospitals", "Andhra Hospitals", "Ramesh Hospitals", "Sentini Hospitals", "Kamineni Hospitals", "Rainbow Hospitals", "Liberty Hospitals", "Help Hospitals", "Aayush Hospitals", "Time Hospital"],
    "Visakhapatnam": ["SevenHills Hospital", "Care Hospitals", "Apollo Health City", "MyCure Hospitals", "Indus Hospitals", "KIMS ICON Hospital", "Queen's NRI Hospital", "Omni RK Hospital", "Pinnacle Hospitals", "Medicover Hospitals"],
    "Kurnool": ["Kurnool Government General Hospital", "Viswabharathi Hospital", "Ravi Nursing Home", "Life Line Hospital", "KIMS Hospitals", "Medicover Hospitals", "Omega Hospital", "Gowri Gopal Hospital", "Rainbow Hospitals", "City Hospital"],
    "Guntur": ["NRI General Hospital", "KIMS Saveera Hospital", "Ramesh Hospitals", "Lalitha Super Specialties Hospital", "Manipal Hospitals", "Coastal Care Hospital", "Amaravathi Hospital", "Vedanta Hospital", "Bhasyam Hospital", "Guntur City Hospital"]
};

const defaultHospitals = (district) => [
    `${district} General Hospital`, `${district} City Hospital`, `${district} Prime Care`, 
    `${district} Health Institute`, `${district} Multi Specialty`, `${district} Nursing Home`,
    `${district} Super Specialty`, `${district} Life Line`, `${district} Relief Hospital`, `${district} Hope Hospital`
];

const specializations = [
    "Cardiologist", "Neurologist", "Orthopedic", "Dermatologist", 
    "Pediatrician", "Gynecologist", "General Physician", 
    "ENT Specialist", "Psychiatrist", "Gastroenterologist"
];

const firstNames = ["Rahul", "Anjali", "Vikram", "Sneha", "Amit", "Pooja", "Rohan", "Sonal", "Deepak", "Kavita", "Arjun", "Kiran", "Sanjay", "Meera", "Aditya", "Neha"];
const lastNames = ["Sharma", "Verma", "Singh", "Reddy", "Gupta", "Das", "Mehta", "Iyer", "Rao", "Joshi", "Patel", "Nair", "Kapoor", "Choudhury", "Malhotra", "Hassan"];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for MediBook seeding...');

        // Clear existing data EXCEPT Admin users
        await District.deleteMany({});
        await Hospital.deleteMany({});
        await Doctor.deleteMany({});
        // Keep Admin users if they exist, but we might want to clear them too for a clean state
        // await User.deleteMany({ role: 'patient' }); 
        
        console.log('Cleared existing District, Hospital, and Doctor collections.');

        const allDoctors = [];

        for (const dist of districtsData) {
            // Create District
            await District.create(dist);

            const names = hospitalNamesMap[dist.name] || defaultHospitals(dist.name);

            // Generate 10 Hospitals for this district
            for (let i = 0; i < 10; i++) {
                const hospital = new Hospital({
                    name: names[i] || `${dist.name} Hospital ${i+1}`,
                    district: dist.name,
                    address: `${dist.name}, ${dist.state}`
                });
                const savedHospital = await hospital.save();

                // Generate 30 Doctors for this hospital
                for (let j = 1; j <= 30; j++) {
                    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                    const spec = specializations[Math.floor(Math.random() * specializations.length)];
                    
                    allDoctors.push({
                        name: `Dr. ${firstName} ${lastName}`,
                        specialization: spec,
                        experience: Math.floor(Math.random() * 20) + 1,
                        consultationFee: Math.floor(Math.random() * 500) + 300, // Consultation fee
                        hospitalId: savedHospital._id,
                        district: dist.name,
                        available: true
                    });
                }
            }
            console.log(`Seeded hospitals and doctor data for ${dist.name}`);
        }

        // Batch insert doctors for better performance
        console.log(`Inserting ${allDoctors.length} doctors...`);
        await Doctor.insertMany(allDoctors);
        console.log('Successfully seeded all location-based real data.');

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
