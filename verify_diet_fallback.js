
// Mock Browser Environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.window = {
  dispatchEvent: () => {}
};
global.fetch = async () => {
  throw new Error("Network Error - Testing Fallback");
};

// Import modules
import { healthService } from './src/services/healthService.js';
import { dietFallback } from './src/data/dietFallback.js';

async function testFallback() {
  console.log("Starting Diet Fallback Verification...");

  const userProfile = {
    constitution: { type: '气虚质', desc: 'Test Desc' },
    basicInfo: { weight: 60, height: 170, age: 30, gender: 'male', activity: 'light' }
  };

  try {
    const result = await healthService.generate_meal_plan(userProfile);
    
    // Check if result matches '气虚质' fallback
    const expected = dietFallback['气虚质'];
    
    if (result.breakfast.name === expected.breakfast.name &&
        result.lunch.name === expected.lunch.name) {
      console.log("SUCCESS: Fallback mechanism worked correctly for '气虚质'.");
      console.log("Returned Plan Sample:", result.breakfast.name);
    } else {
      console.error("FAILURE: Returned plan does not match fallback data.");
      console.log("Expected:", expected.breakfast.name);
      console.log("Got:", result.breakfast.name);
    }

    // Test with unknown constitution (should default to 平和质)
    const unknownProfile = { constitution: { type: 'UnknownType' } };
    const resultDefault = await healthService.generate_meal_plan(unknownProfile);
    const expectedDefault = dietFallback['平和质'];

    if (resultDefault.breakfast.name === expectedDefault.breakfast.name) {
      console.log("SUCCESS: Default fallback worked correctly for unknown constitution.");
    } else {
      console.error("FAILURE: Default fallback failed.");
    }

  } catch (error) {
    console.error("TEST ERROR:", error);
  }
}

testFallback();
