'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function responder(prompt: string, mensagem: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4', // ou 'gpt-3.5-turbo'
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: mensagem },
    ],
    temperature: 0.7,
  })

  return completion.choices[0].message.content ?? 'Sem resposta da IA.'
}
