'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting data from waste receipt images.
 *
 * - extractWasteReceiptData - A function that handles the waste receipt data extraction process.
 * - WasteReceiptDataExtractionInput - The input type for the extractWasteReceiptData function, which includes the receipt image as a data URI.
 * - WasteReceiptDataExtractionOutput - The return type for the extractWasteReceiptData function, containing the extracted data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WasteReceiptDataExtractionInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "The waste receipt image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type WasteReceiptDataExtractionInput = z.infer<typeof WasteReceiptDataExtractionInputSchema>;

const WasteReceiptDataExtractionOutputSchema = z.object({
  gpName: z.string().describe('The name of the Gram Panchayat.'),
  ulbName: z.string().describe('The name of the Urban Local Body.'),
  vehicleDetails: z.string().describe('Details of the vehicle used for transport.'),
  wasteQuantities: z.string().describe('Quantities of different waste types.'),
});
export type WasteReceiptDataExtractionOutput = z.infer<typeof WasteReceiptDataExtractionOutputSchema>;

export async function extractWasteReceiptData(input: WasteReceiptDataExtractionInput): Promise<WasteReceiptDataExtractionOutput> {
  return extractWasteReceiptDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'wasteReceiptDataExtractionPrompt',
  input: {schema: WasteReceiptDataExtractionInputSchema},
  output: {schema: WasteReceiptDataExtractionOutputSchema},
  prompt: `You are an expert data extraction specialist, skilled at extracting information from receipts.

You will receive an image of a waste receipt. Your task is to extract the following information from the receipt:
- Gram Panchayat (GP) name
- Urban Local Body (ULB) name
- Vehicle details
- Waste quantities for each waste type

Return the extracted data in JSON format.

Waste Receipt Image: {{media url=receiptImage}}`,
});

const extractWasteReceiptDataFlow = ai.defineFlow(
  {
    name: 'extractWasteReceiptDataFlow',
    inputSchema: WasteReceiptDataExtractionInputSchema,
    outputSchema: WasteReceiptDataExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
