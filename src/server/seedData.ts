import { lessonFactory } from '../lessons/lessonFactory';

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with comprehensive lesson data...');

    // Create sample lessons with exercises
    await lessonFactory.createSampleLessons();

    console.log('✅ Database seeded successfully with lessons and exercises');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
