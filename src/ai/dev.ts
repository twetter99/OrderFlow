import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-stock-needs.ts';
import '@/ai/flows/check-item-price.ts';
import '@/ai/flows/suggest-suppliers.ts';
import '@/ai/flows/generate-purchase-order.ts';
import '@/ai/flows/send-approval-email.ts';
