const mongoose = require('mongoose');
const Template = require('../models/Template');
require('dotenv').config();

const templates = [
  {
    name: "Road Infrastructure",
    description: "Information about road construction, repairs, and maintenance",
    category: "Infrastructure",
    icon: "Road",
    color: "bg-blue-500",
    isPopular: true,
    tags: ["Roads", "Construction", "PWD", "Municipal"],
    language: "english",
    templateContent: `To,
The Public Information Officer,
{{department}},
{{location}}

Subject: Application under Right to Information Act, 2005 - Road Infrastructure Information

Sir/Madam,

I, {{applicantName}}, a citizen of India, hereby request the following information under the Right to Information Act, 2005:

I would like to obtain information regarding road infrastructure in {{area}} for the period {{timeframe}}.

Specifically, I request the following information:

1. Details of road construction and repair work carried out in {{area}}
2. Budget allocation and actual expenditure for road projects
3. Names and details of contractors engaged for road work
4. Quality control measures and testing reports
5. Timeline for completion of ongoing projects
6. Maintenance schedule for existing roads
7. Details of any complaints received regarding road conditions
8. Action taken on previous complaints

I am willing to pay the prescribed fee for obtaining this information. If any additional fee is required, please inform me in advance.

I request you to provide the information within 30 days as stipulated under Section 7(1) of the RTI Act, 2005.

If the information sought is not available with your office, please transfer this application to the concerned department under Section 6(3) of the RTI Act and inform me accordingly.

Thanking you,

Yours faithfully,
{{applicantName}}
Address: {{address}}
Phone: {{phone}}
Email: {{email}}

Date: {{date}}
Place: {{location}}`,
    variables: [
      { name: "department", type: "text", label: "Department", placeholder: "e.g., Public Works Department", required: true },
      { name: "location", type: "text", label: "Location", placeholder: "e.g., New Delhi", required: true },
      { name: "applicantName", type: "text", label: "Your Name", required: true },
      { name: "area", type: "text", label: "Area of Interest", placeholder: "e.g., Sector 15", required: true },
      { name: "timeframe", type: "text", label: "Time Period", placeholder: "e.g., January 2023 to December 2023", required: true },
      { name: "address", type: "textarea", label: "Your Address", required: true },
      { name: "phone", type: "text", label: "Phone Number", required: true },
      { name: "email", type: "text", label: "Email Address", required: true },
      { name: "date", type: "date", label: "Date", required: true }
    ],
    preview: "Request information about road construction projects, budget allocation, contractor details, and completion timelines in your area."
  },
  {
    name: "Electricity & Power",
    description: "Power supply, billing, and electrical infrastructure queries",
    category: "Utilities",
    icon: "Zap",
    color: "bg-yellow-500",
    isPopular: true,
    tags: ["Electricity", "Power", "DISCOM", "Billing"],
    language: "english",
    templateContent: `To,
The Public Information Officer,
{{department}},
{{location}}

Subject: Application under Right to Information Act, 2005 - Electricity and Power Supply Information

Sir/Madam,

I, {{applicantName}}, a citizen of India, hereby request the following information under the Right to Information Act, 2005:

I would like to obtain information regarding electricity supply and power infrastructure in {{area}}.

Specifically, I request the following information:

1. Details of power outages and their causes in {{area}} for the period {{timeframe}}
2. Load shedding schedule and duration
3. Details of transformers and their capacity in the area
4. Information about new electrical connections and pending applications
5. Details of power theft cases and action taken
6. Budget allocation for electrical infrastructure development
7. Details of complaints received regarding power supply
8. Action taken on power-related grievances
9. Information about renewable energy projects in the area
10. Details of electrical safety measures and inspections

I am willing to pay the prescribed fee for obtaining this information. If any additional fee is required, please inform me in advance.

I request you to provide the information within 30 days as stipulated under Section 7(1) of the RTI Act, 2005.

If the information sought is not available with your office, please transfer this application to the concerned department under Section 6(3) of the RTI Act and inform me accordingly.

Thanking you,

Yours faithfully,
{{applicantName}}
Address: {{address}}
Phone: {{phone}}
Email: {{email}}

Date: {{date}}
Place: {{location}}`,
    variables: [
      { name: "department", type: "text", label: "Department", placeholder: "e.g., Electricity Board", required: true },
      { name: "location", type: "text", label: "Location", placeholder: "e.g., New Delhi", required: true },
      { name: "applicantName", type: "text", label: "Your Name", required: true },
      { name: "area", type: "text", label: "Area of Interest", placeholder: "e.g., Sector 15", required: true },
      { name: "timeframe", type: "text", label: "Time Period", placeholder: "e.g., Last 6 months", required: true },
      { name: "address", type: "textarea", label: "Your Address", required: true },
      { name: "phone", type: "text", label: "Phone Number", required: true },
      { name: "email", type: "text", label: "Email Address", required: true },
      { name: "date", type: "date", label: "Date", required: true }
    ],
    preview: "Get details about power outages, electricity billing, transformer installations, and power supply projects."
  },
  {
    name: "Education & Schools",
    description: "School admissions, infrastructure, and educational policies",
    category: "Education",
    icon: "GraduationCap",
    color: "bg-green-500",
    isPopular: false,
    tags: ["Education", "Schools", "Admissions", "Teachers"],
    language: "english",
    templateContent: `To,
The Public Information Officer,
{{department}},
{{location}}

Subject: Application under Right to Information Act, 2005 - Education and School Information

Sir/Madam,

I, {{applicantName}}, a citizen of India, hereby request the following information under the Right to Information Act, 2005:

I would like to obtain information regarding educational facilities and policies in {{area}}.

Specifically, I request the following information:

1. Details of government schools in {{area}} and their infrastructure
2. Information about teacher appointments and vacancies
3. Details of school admission procedures and criteria
4. Information about educational schemes and benefits
5. Details of school building construction and renovation projects
6. Information about mid-day meal scheme implementation
7. Details of student enrollment and dropout rates
8. Information about school performance and academic results
9. Details of complaints received regarding schools
10. Action taken on educational grievances

I am willing to pay the prescribed fee for obtaining this information. If any additional fee is required, please inform me in advance.

I request you to provide the information within 30 days as stipulated under Section 7(1) of the RTI Act, 2005.

If the information sought is not available with your office, please transfer this application to the concerned department under Section 6(3) of the RTI Act and inform me accordingly.

Thanking you,

Yours faithfully,
{{applicantName}}
Address: {{address}}
Phone: {{phone}}
Email: {{email}}

Date: {{date}}
Place: {{location}}`,
    variables: [
      { name: "department", type: "text", label: "Department", placeholder: "e.g., Education Department", required: true },
      { name: "location", type: "text", label: "Location", placeholder: "e.g., New Delhi", required: true },
      { name: "applicantName", type: "text", label: "Your Name", required: true },
      { name: "area", type: "text", label: "Area of Interest", placeholder: "e.g., Sector 15", required: true },
      { name: "address", type: "textarea", label: "Your Address", required: true },
      { name: "phone", type: "text", label: "Phone Number", required: true },
      { name: "email", type: "text", label: "Email Address", required: true },
      { name: "date", type: "date", label: "Date", required: true }
    ],
    preview: "Information about school admissions, teacher appointments, infrastructure development, and educational schemes."
  },
  {
    name: "Healthcare Services",
    description: "Hospital facilities, medical schemes, and health programs",
    category: "Healthcare",
    icon: "Heart",
    color: "bg-red-500",
    isPopular: false,
    tags: ["Healthcare", "Hospitals", "Medical", "Health Schemes"],
    language: "english",
    templateContent: `To,
The Public Information Officer,
{{department}},
{{location}}

Subject: Application under Right to Information Act, 2005 - Healthcare Services Information

Sir/Madam,

I, {{applicantName}}, a citizen of India, hereby request the following information under the Right to Information Act, 2005:

I would like to obtain information regarding healthcare facilities and services in {{area}}.

Specifically, I request the following information:

1. Details of government hospitals and health centers in {{area}}
2. Information about medical equipment and facilities available
3. Details of health schemes and programs implemented
4. Information about doctor and staff appointments
5. Details of patient care and treatment statistics
6. Information about ambulance services and emergency care
7. Details of vaccination programs and health campaigns
8. Information about medicine availability and procurement
9. Details of complaints received regarding healthcare services
10. Action taken on health-related grievances

I am willing to pay the prescribed fee for obtaining this information. If any additional fee is required, please inform me in advance.

I request you to provide the information within 30 days as stipulated under Section 7(1) of the RTI Act, 2005.

If the information sought is not available with your office, please transfer this application to the concerned department under Section 6(3) of the RTI Act and inform me accordingly.

Thanking you,

Yours faithfully,
{{applicantName}}
Address: {{address}}
Phone: {{phone}}
Email: {{email}}

Date: {{date}}
Place: {{location}}`,
    variables: [
      { name: "department", type: "text", label: "Department", placeholder: "e.g., Health Department", required: true },
      { name: "location", type: "text", label: "Location", placeholder: "e.g., New Delhi", required: true },
      { name: "applicantName", type: "text", label: "Your Name", required: true },
      { name: "area", type: "text", label: "Area of Interest", placeholder: "e.g., Sector 15", required: true },
      { name: "address", type: "textarea", label: "Your Address", required: true },
      { name: "phone", type: "text", label: "Phone Number", required: true },
      { name: "email", type: "text", label: "Email Address", required: true },
      { name: "date", type: "date", label: "Date", required: true }
    ],
    preview: "Details about hospital services, medical equipment, health schemes, and healthcare infrastructure."
  },
  {
    name: "Ration & Food Security",
    description: "PDS, ration cards, and food distribution programs",
    category: "Food Security",
    icon: "Home",
    color: "bg-orange-500",
    isPopular: true,
    tags: ["Ration", "PDS", "Food Security", "Subsidies"],
    language: "english",
    templateContent: `To,
The Public Information Officer,
{{department}},
{{location}}

Subject: Application under Right to Information Act, 2005 - Ration and Food Security Information

Sir/Madam,

I, {{applicantName}}, a citizen of India, hereby request the following information under the Right to Information Act, 2005:

I would like to obtain information regarding ration and food distribution programs in {{area}}.

Specifically, I request the following information:

1. Details of PDS (Public Distribution System) shops in {{area}}
2. Information about ration card applications and processing
3. Details of food grain distribution and availability
4. Information about subsidy schemes and benefits
5. Details of food quality and storage facilities
6. Information about complaints received regarding PDS
7. Details of action taken on ration-related grievances
8. Information about new ration card distribution
9. Details of food security programs and initiatives
10. Information about beneficiary lists and eligibility criteria

I am willing to pay the prescribed fee for obtaining this information. If any additional fee is required, please inform me in advance.

I request you to provide the information within 30 days as stipulated under Section 7(1) of the RTI Act, 2005.

If the information sought is not available with your office, please transfer this application to the concerned department under Section 6(3) of the RTI Act and inform me accordingly.

Thanking you,

Yours faithfully,
{{applicantName}}
Address: {{address}}
Phone: {{phone}}
Email: {{email}}

Date: {{date}}
Place: {{location}}`,
    variables: [
      { name: "department", type: "text", label: "Department", placeholder: "e.g., Food & Civil Supplies Department", required: true },
      { name: "location", type: "text", label: "Location", placeholder: "e.g., New Delhi", required: true },
      { name: "applicantName", type: "text", label: "Your Name", required: true },
      { name: "area", type: "text", label: "Area of Interest", placeholder: "e.g., Sector 15", required: true },
      { name: "address", type: "textarea", label: "Your Address", required: true },
      { name: "phone", type: "text", label: "Phone Number", required: true },
      { name: "email", type: "text", label: "Email Address", required: true },
      { name: "date", type: "date", label: "Date", required: true }
    ],
    preview: "Information about ration card applications, PDS shops, food grain distribution, and subsidy schemes."
  }
];

async function seedTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rti-assistant');
    console.log('Connected to MongoDB');

    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert new templates
    const createdTemplates = await Template.insertMany(templates);
    console.log(`Created ${createdTemplates.length} templates`);

    // Display created templates
    createdTemplates.forEach(template => {
      console.log(`- ${template.name} (${template.category})`);
    });

    console.log('Template seeding completed successfully');
  } catch (error) {
    console.error('Error seeding templates:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedTemplates();
}

module.exports = { seedTemplates, templates };
