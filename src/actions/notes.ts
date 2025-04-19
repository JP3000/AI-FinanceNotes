"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import openai from "@/deepSeek";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const createNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to create a note");

    await prisma.note.create({
      data: {
        id: noteId,
        authorId: user.id,
        text: "",
      },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateNoteAction = async (noteId: string, text: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to update a note");

    await prisma.note.update({
      where: { id: noteId },
      data: { text },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to delete a note");

    await prisma.note.delete({
      where: { id: noteId, authorId: user.id },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const askAIAboutNotesAction = async (
  newQuestions: string[],
  responses: string[],
) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in to ask AI questions");

  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { text: true, createdAt: true, updatedAt: true },
  });

  if (notes.length === 0) {
    return "You don't have any notes yet.";
  }

  // const formattedNotes = notes
  //   .map((note) =>
  //     `
  //     Text: ${note.text}
  //     Created at: ${note.createdAt}
  //     Last updated: ${note.updatedAt}
  //     `.trim(),
  //   )
  //   .join("\n");

  // const messages: ChatCompletionMessageParam[] = [
  //   {
  //     role: "system",
  //     content: `
  //         You are a helpful assistant that answers questions about a user's notes. 
  //         Assume all questions are related to the user's notes. 
  //         Make sure that your answers are not too verbose and you speak succinctly. 
  //         Your responses MUST be formatted in clean, valid HTML with proper structure. 
  //         Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
  //         Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
  //         Avoid inline styles, JavaScript, or custom attributes.
          
  //         Rendered like this in JSX:
  //         <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />
    
  //         Here are the user's notes:
  //         ${formattedNotes}
  //         `,
  //   },
  // ];

  const formattedNotes = notes
  .map((note) =>
    `
    <article class="financial-note">
      <h3>${note.text.split('\n')[0]?.replace('Title: ', '') || 'Untitled Note'}</h3>
      ${note.text.split('\n').slice(1).map(line => {
        if (line.startsWith('URL:')) {
          return `<p><strong>Source Link:</strong> <a href="${line.replace('URL: ', '')}" target="_blank" rel="noopener">View Original</a></p>`;
        }
        return `<p>${line}</p>`;
      }).join('')}
      <footer>
        <time>Created: ${new Date(note.createdAt).toLocaleDateString()}</time>
        ${note.updatedAt !== note.createdAt ? 
          `<time> | Updated: ${new Date(note.updatedAt).toLocaleDateString()}</time>` : ''}
      </footer>
    </article>
    `.trim()
  )
  .join("\n<hr>\n");

const messages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: `
        You are a <strong>Senior Financial Research Assistant</strong> specialized in equity analysis and market trends.
        Your responses should reflect Wall Street analyst-level professionalism with these characteristics:
        
        <ul>
          <li>Always reference specific data points from the notes when available</li>
          <li>Highlight <em>key financial metrics</em>, <em>technical indicators</em>, and <em>sentiment analysis</em></li>
          <li>Use proper financial terminology (e.g. "support/resistance levels" instead of "high/low points")</li>
          <li>Flag potential <span class="risk">risks</span> and <span class="opportunity">opportunities</span> explicitly</li>
          <li>Maintain concise bullet-point style for actionable insights</li>
        </ul>
        
        <h4>Current Market Context (Q2 2025):</h4>
        <ul>
          <li>AI chip sector P/E multiples expanding</li>
          <li>Geopolitical tensions affecting semiconductor supply chains</li>
          <li>Fed funds rate at 4.25-4.50%</li>
        </ul>
        
        <h4>Notes Database:</h4>
        ${formattedNotes}
        
        <style type="text/css">
          .risk { color: #ef4444; font-weight: 600; }
          .opportunity { color: #10b981; font-weight: 600; }
          article.financial-note { 
            border-left: 3px solid #3b82f6;
            padding-left: 1rem;
            margin-bottom: 1.5rem;
          }
          time { font-size: 0.875rem; color: #64748b; }
        </style>
        `.replace(/\n\s+/g, '\n').trim(),
  }
];


  for (let i = 0; i < newQuestions.length; i++) {
    messages.push({ role: "system", content: newQuestions[i] });
    if (responses.length > i) {
      messages.push({ role: "system", content: responses[i] });
    }
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: "deepseek-chat",
  });

  return completion.choices[0].message.content || "A problem has occurred";
};