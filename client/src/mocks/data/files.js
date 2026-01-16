import { faker } from '@faker-js/faker';

// Generate mock files
const fileTypes = ['pdf', 'docx', 'pptx', 'xlsx', 'zip'];
const categories = ['Assignment', 'Notes', 'Study Material', 'Question Paper', 'Solution'];

const generateFiles = () => {
  const files = [];
  const today = new Date();
  
  for (let i = 0; i < 25; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 3); // Files uploaded every 3 days
    
    const fileType = faker.helpers.arrayElement(fileTypes);
    const category = faker.helpers.arrayElement(categories);
    
    files.push({
      id: i + 1,
      name: `${category}_${faker.lorem.word()}.${fileType}`,
      type: fileType,
      category,
      size: faker.number.int({ min: 100, max: 10000 }), // KB
      uploadedBy: faker.person.fullName(),
      uploadedAt: date.toISOString(),
      description: faker.lorem.sentence(),
      subject: faker.helpers.arrayElement(['Mathematics', 'Science', 'English', 'Social Studies']),
      class: 'Class 10',
      downloads: faker.number.int({ min: 0, max: 150 }),
      url: `#`, // Mock URL
    });
  }
  
  return files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

export const files = generateFiles();

// Helper to format file size
export const formatFileSize = (sizeInKB) => {
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  }
  return `${(sizeInKB / 1024).toFixed(2)} MB`;
};

export default files;
