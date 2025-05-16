// BasicCommissionCalculator.ts
const chalk = require('chalk');


// CommissionData interface
export interface CommissionData {
  commissionRate: number;
  clientName: string;
  supplierName: string;
  bookingNumber: string;
  finalPaymentDate: string;
  invoiced: boolean;
  commissionAmount: number;
  calculatedCommission: number;
  paid: boolean;
  monthPaid: string;
  yearPaid: string;
  notes: string;
}

// Use `any` for rl to avoid type issues from readline namespace
export const calculateCommission = async (
  rl: any,
  askQuestion: (question: string) => Promise<string>
): Promise<void> => {
  const data: CommissionData = {
    commissionRate: 0,
    clientName: "",
    supplierName: "",
    bookingNumber: "",
    finalPaymentDate: "",
    invoiced: false,
    commissionAmount: 0,
    calculatedCommission: 0,
    paid: false,
    monthPaid: "",
    yearPaid: "",
    notes: ""
  };

  data.commissionRate = parseFloat(await askQuestion("Commission Rate (%) → "));
  data.clientName = await askQuestion("Client Name → ");
  data.supplierName = await askQuestion("Supplier Name → ");
  data.bookingNumber = await askQuestion("Booking # → ");
  data.finalPaymentDate = await askQuestion("Final Payment Date (YYYY-MM-DD) → ");

  const invoicedInput = await askQuestion("Invoiced? (yes/no) → ");
  data.invoiced = invoicedInput.toLowerCase() === 'yes';

  data.commissionAmount = parseFloat(await askQuestion("Commission Amount $ → "));
  data.calculatedCommission = (data.commissionRate * data.commissionAmount) / 100;

  const paidInput = await askQuestion("Paid? (yes/no) → ");
  data.paid = paidInput.toLowerCase() === 'yes';

  data.monthPaid = await askQuestion("Month Paid → ");
  data.yearPaid = await askQuestion("Year Paid → ");
  data.notes = await askQuestion("Notes → ");

  // Show summary
  console.log(chalk.magenta("===== Commission Summary ====="));
  console.log(`Client: ${chalk.cyan(data.clientName)}`);
console.log(`Supplier: ${chalk.cyan(data.supplierName)}`);
console.log(`Booking #: ${chalk.cyan(data.bookingNumber)}`);
console.log(`Final Payment Date: ${chalk.cyan(data.finalPaymentDate)}`);
console.log(`Commission (${data.commissionRate}%): ${chalk.bold.yellow(`$${data.calculatedCommission.toFixed(2)}`)}`);
console.log(`Commission Amount Entered: ${chalk.blue(`$${data.commissionAmount.toFixed(2)}`)}`);
console.log(`Invoiced: ${data.invoiced ? chalk.green('Yes') : chalk.red('No')}`);
console.log(`Paid: ${data.paid ? chalk.green('Yes') : chalk.red('No')}`);
console.log(`Month Paid: ${chalk.cyan(data.monthPaid)}`);
console.log(`Year Paid: ${chalk.cyan(data.yearPaid)}`);
console.log(`Notes: ${chalk.gray(data.notes)}`);
  console.log(chalk.magenta("================================\n"));
};
