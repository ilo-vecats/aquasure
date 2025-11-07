require('dotenv').config();
const mongoose = require('mongoose');
const Sample = require('../models/Sample');

// Realistic Jaipur water quality data
// Based on actual studies: Jaipur groundwater shows elevated TDS, some areas exceed permissible limits
// Studies indicate: pH typically 7.0-8.5, TDS often 400-900 mg/L, some areas with quality concerns
// Representative data for demonstration purposes - reflects real-world Jaipur water quality patterns
// Locations in Jaipur with varying water quality
const jaipurSamples = [
  // Vidyadhar Nagar - Good quality
  {
    location: 'Vidyadhar Nagar, Sector 1',
    ph: 7.2,
    tds: 420,
    turbidity: 0.8,
    chlorine: 0.35,
    temperature: 28,
    notes: 'Regular monitoring - within acceptable limits'
  },
  {
    location: 'Vidyadhar Nagar, Sector 5',
    ph: 7.1,
    tds: 450,
    turbidity: 0.9,
    chlorine: 0.32,
    temperature: 27,
    notes: 'Standard quality parameters'
  },
  // Jhotwara - Moderate quality
  {
    location: 'Jhotwara Industrial Area',
    ph: 7.8,
    tds: 680,
    turbidity: 1.8,
    chlorine: 0.28,
    temperature: 29,
    notes: 'Slightly elevated TDS - monitoring required'
  },
  {
    location: 'Jhotwara Residential',
    ph: 7.5,
    tds: 620,
    turbidity: 1.5,
    chlorine: 0.30,
    temperature: 28,
    notes: 'Within acceptable range'
  },
  // Malviya Nagar - Good quality
  {
    location: 'Malviya Nagar, Block A',
    ph: 7.0,
    tds: 380,
    turbidity: 0.6,
    chlorine: 0.38,
    temperature: 27,
    notes: 'Excellent water quality'
  },
  {
    location: 'Malviya Nagar, Block C',
    ph: 7.1,
    tds: 395,
    turbidity: 0.7,
    chlorine: 0.36,
    temperature: 27,
    notes: 'Good quality maintained'
  },
  // C-Scheme - Premium area, good quality
  {
    location: 'C-Scheme, Ashok Marg',
    ph: 6.9,
    tds: 350,
    turbidity: 0.5,
    chlorine: 0.40,
    temperature: 26,
    notes: 'Premium quality - well maintained'
  },
  {
    location: 'C-Scheme, Tonk Road',
    ph: 7.0,
    tds: 365,
    turbidity: 0.6,
    chlorine: 0.38,
    temperature: 27,
    notes: 'Consistent quality'
  },
  // Mansarovar - Mixed quality
  {
    location: 'Mansarovar, Sector 7',
    ph: 7.6,
    tds: 720,
    turbidity: 2.1,
    chlorine: 0.25,
    temperature: 29,
    notes: 'Borderline quality - increased monitoring'
  },
  {
    location: 'Mansarovar, Sector 3',
    ph: 7.3,
    tds: 580,
    turbidity: 1.2,
    chlorine: 0.33,
    temperature: 28,
    notes: 'Acceptable quality'
  },
  // Vaishali Nagar - Good quality
  {
    location: 'Vaishali Nagar, Block A',
    ph: 7.2,
    tds: 410,
    turbidity: 0.8,
    chlorine: 0.34,
    temperature: 28,
    notes: 'Standard quality parameters'
  },
  {
    location: 'Vaishali Nagar, Block D',
    ph: 7.1,
    tds: 435,
    turbidity: 0.9,
    chlorine: 0.32,
    temperature: 27,
    notes: 'Within limits'
  },
  // Bani Park - Moderate quality
  {
    location: 'Bani Park, Near Railway Station',
    ph: 7.9,
    tds: 750,
    turbidity: 2.3,
    chlorine: 0.22,
    temperature: 30,
    notes: 'Elevated parameters - review needed'
  },
  {
    location: 'Bani Park, Residential',
    ph: 7.4,
    tds: 640,
    turbidity: 1.6,
    chlorine: 0.29,
    temperature: 29,
    notes: 'Acceptable but monitoring'
  },
  // Sitapura Industrial - Lower quality (common in industrial areas)
  {
    location: 'Sitapura Industrial Area',
    ph: 8.2,
    tds: 920,
    turbidity: 3.5,
    chlorine: 0.18,
    temperature: 31,
    notes: 'Industrial area - elevated TDS and turbidity, treatment review required'
  },
  {
    location: 'Sitapura, Residential Zone',
    ph: 7.7,
    tds: 680,
    turbidity: 1.9,
    chlorine: 0.26,
    temperature: 29,
    notes: 'Moderate quality - regular checks'
  },
  // Ajmer Road - Mixed
  {
    location: 'Ajmer Road, Near Durgapura',
    ph: 7.3,
    tds: 520,
    turbidity: 1.1,
    chlorine: 0.31,
    temperature: 28,
    notes: 'Good quality maintained'
  },
  {
    location: 'Ajmer Road, Sanganer',
    ph: 7.6,
    tds: 710,
    turbidity: 2.0,
    chlorine: 0.24,
    temperature: 29,
    notes: 'Borderline - increased sampling'
  },
  // More samples with varying dates
  {
    location: 'Raja Park',
    ph: 7.0,
    tds: 390,
    turbidity: 0.7,
    chlorine: 0.37,
    temperature: 27,
    notes: 'Excellent quality'
  },
  {
    location: 'Pink City, Hawa Mahal Area',
    ph: 7.4,
    tds: 560,
    turbidity: 1.3,
    chlorine: 0.30,
    temperature: 28,
    notes: 'Tourist area - regular monitoring'
  },
  {
    location: 'Ambabari',
    ph: 7.2,
    tds: 445,
    turbidity: 0.85,
    chlorine: 0.34,
    temperature: 28,
    notes: 'Standard quality'
  },
  {
    location: 'Shyam Nagar',
    ph: 7.8,
    tds: 850,
    turbidity: 2.6,
    chlorine: 0.20,
    temperature: 30,
    notes: 'Elevated TDS - common in some Jaipur areas, requires monitoring'
  },
  // Additional samples reflecting Jaipur's water quality patterns
  {
    location: 'Rajasthan University Area',
    ph: 7.3,
    tds: 480,
    turbidity: 1.0,
    chlorine: 0.33,
    temperature: 28,
    notes: 'Institutional area - acceptable quality'
  },
  {
    location: 'Tonk Road, Near Airport',
    ph: 7.6,
    tds: 720,
    turbidity: 1.9,
    chlorine: 0.27,
    temperature: 29,
    notes: 'Borderline quality - regular monitoring'
  },
  {
    location: 'Pratap Nagar',
    ph: 7.1,
    tds: 410,
    turbidity: 0.75,
    chlorine: 0.35,
    temperature: 27,
    notes: 'Good quality maintained'
  },
  // Additional samples to fill the timeline (Sep 7 - Oct 15)
  {
    location: 'JLN Marg, Civil Lines',
    ph: 7.2,
    tds: 440,
    turbidity: 0.85,
    chlorine: 0.34,
    temperature: 28,
    notes: 'Government area - regular monitoring'
  },
  {
    location: 'Sanganer Industrial Estate',
    ph: 8.0,
    tds: 880,
    turbidity: 3.0,
    chlorine: 0.19,
    temperature: 31,
    notes: 'Industrial zone - elevated parameters'
  },
  {
    location: 'Gopalpura Bypass',
    ph: 7.4,
    tds: 590,
    turbidity: 1.4,
    chlorine: 0.31,
    temperature: 29,
    notes: 'Mixed residential-commercial area'
  },
  {
    location: 'Sodala',
    ph: 7.6,
    tds: 700,
    turbidity: 2.0,
    chlorine: 0.26,
    temperature: 29,
    notes: 'Borderline quality - monitoring'
  },
  {
    location: 'Raja Park Extension',
    ph: 7.0,
    tds: 400,
    turbidity: 0.7,
    chlorine: 0.36,
    temperature: 27,
    notes: 'Residential area - good quality'
  },
  {
    location: 'Khatipura',
    ph: 7.7,
    tds: 760,
    turbidity: 2.2,
    chlorine: 0.23,
    temperature: 30,
    notes: 'Mixed area - requires attention'
  },
  {
    location: 'Sindhi Camp',
    ph: 7.5,
    tds: 650,
    turbidity: 1.7,
    chlorine: 0.28,
    temperature: 29,
    notes: 'Commercial area - acceptable quality'
  },
  {
    location: 'Bapu Nagar',
    ph: 7.1,
    tds: 425,
    turbidity: 0.8,
    chlorine: 0.33,
    temperature: 28,
    notes: 'Residential - standard quality'
  }
];

// Function to compute quality index
function computeQualityIndex({ ph, tds, turbidity, chlorine }) {
  let score = 100;
  
  if (ph < 6.5 || ph > 8.5) {
    score -= Math.abs(ph - 7) * 8;
  } else {
    score -= Math.abs(ph - 7) * 3;
  }
  
  if (tds > 500) {
    score -= (tds - 500) / 10;
  }
  if (tds > 1000) {
    score -= 20;
  }
  
  if (turbidity > 1) {
    score -= (turbidity - 1) * 5;
  }
  if (turbidity > 5) {
    score -= 15;
  }
  
  if (chlorine < 0.2) {
    score -= (0.2 - chlorine) * 50;
  } else if (chlorine > 1.0) {
    score -= (chlorine - 1.0) * 30;
  } else if (chlorine > 0.5) {
    score -= (chlorine - 0.5) * 10;
  }
  
  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aquasure', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing samples
    await Sample.deleteMany({});
    console.log('Cleared existing samples');

    // Add timestamps spread over project timeline: Sep 7 - Oct 15, 2024
    const projectStartDate = new Date('2024-09-07');
    const projectEndDate = new Date('2024-10-15');
    const totalDays = Math.floor((projectEndDate - projectStartDate) / (1000 * 60 * 60 * 24)); // 38 days
    
    const samplesWithDates = jaipurSamples.map((sample, index) => {
      // Spread samples evenly over the project timeline
      const dayOffset = Math.floor((index * totalDays) / jaipurSamples.length);
      const timestamp = new Date(projectStartDate);
      timestamp.setDate(timestamp.getDate() + dayOffset);
      
      // Vary hours throughout the day (8 AM to 6 PM - typical sampling hours)
      const hour = 8 + (index % 10);
      timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      
      const qualityIndex = computeQualityIndex(sample);
      let status = 'Borderline';
      if (qualityIndex >= 80) status = 'Safe';
      else if (qualityIndex < 50) status = 'Unsafe';

      return {
        ...sample,
        timestamp,
        qualityIndex,
        status,
        verified: index % 3 === 0, // Some samples verified
        verifiedBy: index % 3 === 0 ? 'Quality Auditor' : null,
        verifiedAt: index % 3 === 0 ? timestamp : null
      };
    });

    // Insert samples
    await Sample.insertMany(samplesWithDates);
    console.log(`✅ Successfully seeded ${samplesWithDates.length} Jaipur water quality samples`);
    console.log(`📅 Date Range: ${projectStartDate.toLocaleDateString()} to ${projectEndDate.toLocaleDateString()}`);

    // Show summary
    const stats = await Sample.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('\n📊 Sample Status Summary:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    // Show date range of samples
    const dateRange = await Sample.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$timestamp' },
          maxDate: { $max: '$timestamp' }
        }
      }
    ]);
    if (dateRange.length > 0) {
      console.log('\n📆 Sample Date Range:');
      console.log(`   First sample: ${new Date(dateRange[0].minDate).toLocaleString()}`);
      console.log(`   Last sample: ${new Date(dateRange[0].maxDate).toLocaleString()}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

