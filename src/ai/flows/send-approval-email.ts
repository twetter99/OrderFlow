
'use server';

/**
 * @fileOverview Implements a Genkit flow to send a purchase order approval email.
 *
 * - sendApprovalEmail - A function that handles the email sending process.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as nodemailer from 'nodemailer';

// Define the schema and type locally within this file.
// This avoids exporting non-function objects from a "use server" file.
const SendApprovalEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  orderId: z.string().describe('The ID of the purchase order to approve.'),
  orderNumber: z.string().describe('The number of the purchase order.'),
  orderAmount: z.number().describe('The total amount of the purchase order.'),
  approvalUrl: z.string().url().describe('The secure URL to approve the purchase order.'),
  orderDate: z.string().describe("The date the order was created in ISO format."),
});

// Infer the type from the local schema.
type SendApprovalEmailInput = z.infer<typeof SendApprovalEmailInputSchema>;


const sendEmailTool = ai.defineTool(
    {
      name: 'sendEmail',
      description: 'Sends an email to the specified recipient using the configured SMTP server.',
      inputSchema: z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
      }),
    },
    async ({to, subject, body}) => {
       const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

       console.log("Attempting to send email with credentials:", {
            user: GMAIL_USER,
            hasPassword: !!GMAIL_APP_PASSWORD
       });

       if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            const errorMsg = "Gmail credentials are not configured in environment variables.";
            console.error(errorMsg);
            return { success: false, error: errorMsg };
       }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"OrderFlow" <${GMAIL_USER}>`,
        to: to,
        subject: subject,
        html: body,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        return { success: true };
      } catch (error: any) {
        console.error(`❌ Failed to send email:`, error);
        return { success: false, error: error.message };
      }
    }
);
  
const emailPrompt = ai.definePrompt({
    name: 'sendApprovalEmailPrompt',
    input: { schema: SendApprovalEmailInputSchema },
    tools: [sendEmailTool],
    prompt: `You are an assistant responsible for sending purchase order approval emails.
  
      Generate a clear and professional HTML email to the recipient ({{to}}) to inform them about a new purchase order that requires their approval.
      
      The email subject must be: "Solicitud de Aprobación: Orden de Compra {{orderNumber}}".
      
      The email body must be professional, in Spanish, and include:
      - A brief introductory sentence.
      - The purchase order number: {{orderNumber}}.
      - The total amount of the order: {{orderAmount}} EUR.
      - A clear call to action with a styled button linking to the approval URL: {{approvalUrl}}. 
      
      The button must be an HTML anchor tag styled to look like a button. It must have the text "Aprobar Orden de Compra".

      Use the sendEmail tool to send the generated email.`,
});

const sendApprovalEmailFlow = ai.defineFlow(
  {
    name: 'sendApprovalEmailFlow',
    inputSchema: SendApprovalEmailInputSchema,
    outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      console.log("Executing email prompt with input:", input);
      const result = await emailPrompt(input);

      console.log("Prompt result structure:", JSON.stringify(result, null, 2));

      // Correctly extract the tool output from the response history
      const toolResponse = result.history[result.history.length - 1];
      if (toolResponse.role === 'tool' && toolResponse.content[0].toolResponse) {
          const output = toolResponse.content[0].toolResponse.output;
          if (output) {
              return output;
          }
      }

      return { success: false, error: "Could not extract tool result from prompt response" };
    } catch (error) {
       console.error("Error in sendApprovalEmailFlow:", error);
       return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }
);


export async function sendApprovalEmail(input: SendApprovalEmailInput): Promise<{ success: boolean; error?: string }> {
    return sendApprovalEmailFlow(input);
}
