
'use server';

/**
 * @fileOverview Implements a Genkit flow to send a purchase order approval email.
 *
 * - sendApprovalEmail - A function that handles the email sending process.
 * - SendApprovalEmailInput - The input type for the sendApprovalEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SendApprovalEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  orderId: z.string().describe('The ID of the purchase order to approve.'),
  orderNumber: z.string().describe('The number of the purchase order.'),
  orderAmount: z.number().describe('The total amount of the purchase order.'),
  approvalUrl: z.string().url().describe('The secure URL to approve the purchase order.'),
});
export type SendApprovalEmailInput = z.infer<typeof SendApprovalEmailInputSchema>;

const sendEmailTool = ai.defineTool(
    {
      name: 'sendEmail',
      description: 'Sends an email to the specified recipient.',
      inputSchema: z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.object({
        success: z.boolean(),
      }),
    },
    async ({to, subject, body}) => {
      // In a real application, this would integrate with a mail service like SendGrid, Mailgun, or Resend.
      // For this prototype, we'll just log the email to the console.
      console.log('====================================================');
      console.log(`✉️  SENDING EMAIL (SIMULATED)`);
      console.log(`====================================================`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`BODY:\n${body}`);
      console.log('====================================================');
      return {success: true};
    }
);
  
const emailPrompt = ai.definePrompt({
    name: 'sendApprovalEmailPrompt',
    input: {schema: SendApprovalEmailInputSchema},
    tools: [sendEmailTool],
    prompt: `You are an assistant responsible for sending purchase order approval emails.
  
      Generate a clear and professional email to the recipient ({{to}}) to inform them about a new purchase order that requires their approval.
      
      The email subject must be: "Solicitud de Aprobación: Orden de Compra {{orderNumber}}".
      
      The email body must include:
      - A brief introductory sentence.
      - The purchase order number: {{orderNumber}}.
      - The total amount of the order: {{orderAmount}} EUR.
      - A clear call to action with a button linking to the approval URL: {{approvalUrl}}. The button text must be "Aprobar Orden de Compra".
      
      Use the sendEmail tool to send the generated email.`,
});

export const sendApprovalEmailFlow = ai.defineFlow(
    {
      name: 'sendApprovalEmailFlow',
      inputSchema: SendApprovalEmailInputSchema,
      outputSchema: z.void(),
    },
    async (input) => {
      await emailPrompt(input);
    }
);

export async function sendApprovalEmail(input: SendApprovalEmailInput) {
    return sendApprovalEmailFlow(input);
}
