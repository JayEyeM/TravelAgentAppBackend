// HandyToolsCLI.ts

// Command to run this file:
// npx ts-node --project tsconfig.handytools.json src/handyTools/HandyToolsCLI.ts

const readline = require('readline');
const { calculateCommission } = require('./BasicCommissionCalculator');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question: string): Promise<string> => {
  return new Promise(resolve => rl.question(question, resolve));
};


const commissionToolMenu = async (): Promise<void> => {
  console.log('\n=== Commission Tool ===');
  console.log('1. New Commission');
  console.log('2. View All Commissions');
  console.log('3. Back to Main Menu');

  const choice = await askQuestion('Enter your choice → ');

  switch (choice.trim()) {
    case '1':
      await calculateCommission(rl, askQuestion);
      return commissionToolMenu();
    case '2':
      console.log('\n(View All Commissions is not implemented yet.)');
      return commissionToolMenu();
    case '3':
      return showMenu();
    default:
      console.log('Invalid choice.');
      return commissionToolMenu();
  }
};

// Add return type: Promise<void>
const showMenu = async (): Promise<void> => {
  console.log('\n===== Handy Tools Menu =====');
  console.log('1. Basic Commission Calculator');
  console.log('2. Exit');
  console.log('=============================');

  const choice = await askQuestion('Enter your choice → ');

  switch (choice.trim()) {
    case '1':
      return commissionToolMenu(); // Go to sub-menu
    case '2':
      console.log('Goodbye!');
      rl.close();
      break;
    default:
      console.log('Invalid choice. Please try again.');
      return showMenu();
  }
};

// Launch menu
showMenu();
