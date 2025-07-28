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
            hasPassword: !!GMAIL_APP_PASSWORD,
            passwordLength: GMAIL_APP_PASSWORD?.length
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
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`, info.messageId);
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
      
      Example button HTML:
      <a href="{{approvalUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Aprobar Orden de Compra</a>
      
      You MUST use the sendEmail tool to send the email. Call it with the appropriate subject and body.`,
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
      console.log("Starting sendApprovalEmailFlow with input:", input);
      
      // Execute the prompt with the input data
      const result = await emailPrompt(input);
      
      console.log("Prompt execution result:", JSON.stringify(result, null, 2));
      
      // The AI should have called the sendEmail tool
      // We need to check if the tool was called and get its result
      
      // For Genkit, the tool results are typically in the response
      // The exact structure depends on the Genkit version
      // Try different possible structures:
      
      // Option 1: Direct tool response
      if (result && typeof result === 'object' && 'success' in result) {
        return result as { success: boolean; error?: string };
      }
      
      // Option 2: Tool calls array
      if (result && result.toolCalls && Array.isArray(result.toolCalls) && result.toolCalls.length > 0) {
        const toolCall = result.toolCalls[0];
        if (toolCall.result) {
          return toolCall.result;
        }
      }
      
      // Option 3: Messages with tool responses
      if (result && result.messages && Array.isArray(result.messages)) {
        for (const message of result.messages) {
          if (message.toolResponses && Array.isArray(message.toolResponses) && message.toolResponses.length > 0) {
            return message.toolResponses[0];
          }
        }
      }
      
      // Option 4: Check if the result has a text response indicating success
      if (result && result.text && result.text.includes('✅')) {
        return { success: true };
      }
      
      // If we couldn't find the tool response, log everything for debugging
      console.error("Could not extract tool response from result. Full result:", result);
      
      return { 
        success: false, 
        error: "Could not extract email sending result from AI response" 
      };
      
    } catch (error) {
      console.error("Error in sendApprovalEmailFlow:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }
);

// Export the function that external code will call
export async function sendApprovalEmail(input: SendApprovalEmailInput): Promise<{ success: boolean; error?: string }> {
  console.log("sendApprovalEmail called with:", input);
  
  // Validate the input has all required fields
  if (!input.to || !input.orderId || !input.orderNumber || !input.approvalUrl) {
    return { 
      success: false, 
      error: "Missing required fields for approval email" 
    };
  }
  
  try {
    const result = await sendApprovalEmailFlow(input);
    console.log("sendApprovalEmailFlow result:", result);
    return result;
  } catch (error) {
    console.error("Error calling sendApprovalEmailFlow:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send approval email" 
    };
  }
}