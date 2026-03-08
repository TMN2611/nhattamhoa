export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { receiver_name, sender_name, ritual_type, moment } = await req.json()

    if (!receiver_name || !sender_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a poetic Vietnamese writer who creates beautiful, emotional messages for flower rituals. Write in Vietnamese. Keep messages between 2-4 sentences. Make them heartfelt and spiritual.',
            },
            {
              role: 'user',
              content: `Write a beautiful emotional message for a flower ritual.
Sender: ${sender_name}
Receiver: ${receiver_name}
Ritual type: ${ritual_type || 'Love blessing'}
Moment/Intention: ${moment || 'A heartfelt moment'}

Write only the message, no quotation marks.`,
            },
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const message = data.choices?.[0]?.message?.content?.trim()
        if (message) {
          return NextResponse.json({ success: true, message })
        }
      }
    }

    const templates = [
      `${sender_name} gửi đến ${receiver_name} với tất cả tình yêu chân thành nhất. Mỗi cánh hoa là một lời thì thầm, mỗi hương thơm là một ký ức đẹp. Nguyện cầu bình an và hạnh phúc luôn bên em.`,
      `Gửi ${receiver_name}, người mà ${sender_name} trân quý nhất trên đời. Đóa hoa này không chỉ là vật chứng, mà là lời hứa của trái tim - rằng tình yêu này sẽ vĩnh cửu như những cánh hồng bất tử.`,
      `${receiver_name} thân yêu, ${sender_name} muốn gửi đến em nghi lễ hoa này như một lời cảm ơn sâu sắc. Em đã mang đến ánh sáng trong cuộc đời anh, và đóa hoa này sẽ mãi tỏa sáng như tình yêu của chúng ta.`,
      `Từ ${sender_name} đến ${receiver_name}: Giữa muôn vàn cánh hoa trên thế gian, anh chọn đóa hoa này dành riêng cho em. Vì em là duy nhất, và tình yêu này là mãi mãi.`,
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]

    return NextResponse.json({ success: true, message })
  } catch (error: any) {
    console.error('Generate message error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
