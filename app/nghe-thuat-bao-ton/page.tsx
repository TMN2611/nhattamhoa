'use client'

import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

const processSteps = [
  {
    number: 'I',
    title: 'Chọn lựa',
    text: 'Mỗi đóa hồng được chọn ở đỉnh cao nở rộ nhất — khoảnh khắc nó đẹp nhất trong đời. Giống như tình yêu, không phải lúc nào cũng hoàn hảo. Nhưng có những khoảnh khắc, mọi thứ đều đúng.',
  },
  {
    number: 'II',
    title: 'Thanh lọc',
    text: 'Nước và thời gian được thay thế bằng một hợp chất bảo tồn đặc biệt. Từng tế bào hoa được giữ nguyên hình dáng, màu sắc và cả kết cấu mềm mại tự nhiên — như thể thời gian đã ngừng trôi.',
  },
  {
    number: 'III',
    title: 'Nghỉ ngơi',
    text: 'Trong nhiều tuần, đóa hồng nằm yên trong bóng tối, hấp thụ sự bảo vệ. Không ánh sáng. Không xáo trộn. Chỉ có sự kiên nhẫn — giống như tình yêu cần thời gian để lớn lên.',
  },
  {
    number: 'IV',
    title: 'Tái sinh',
    text: 'Khi đóa hồng trở lại, nó không còn là một bông hoa thông thường. Nó là một tác phẩm — một lời hứa đã được khắc vào vĩnh cửu, sẵn sàng cho hành trình bên người bạn yêu.',
  },
]

const reasons = [
  {
    title: 'Không cần nước',
    description: 'Quy trình bảo tồn thay thế hoàn toàn nước trong tế bào hoa, giúp đóa hồng tồn tại mà không cần bất kỳ sự chăm sóc nào.',
  },
  {
    title: 'Không cần ánh sáng',
    description: 'Đóa hồng đã được bảo vệ khỏi tác động của tia UV. Nó giữ nguyên màu sắc dù đặt trong phòng tối hay ánh sáng nhẹ.',
  },
  {
    title: 'Giữ nguyên vẻ tự nhiên',
    description: 'Không sơn, không nhuộm, không phủ nhựa. Cánh hoa vẫn mềm mại, vân hoa vẫn mịn màng — đẹp như ngày đầu tiên.',
  },
  {
    title: 'Bền vững qua năm tháng',
    description: 'Trong điều kiện bảo quản tốt, mỗi đóa hồng Nhất Tâm giữ được vẻ đẹp từ 3 đến 5 năm, thậm chí lâu hơn.',
  },
]

export default function PreservationArtPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.04) 0%, transparent 70%)',
          }}
        />
        <FadeInSection>
          <p className="text-xs tracking-[0.4em] uppercase mb-6 text-gold-dim">
            {'Nghệ thuật bảo tồn vĩnh cửu'}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight font-display text-balance text-foreground">
            {'Một lời hứa không thể phai theo thời gian'}
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-lg md:text-xl leading-relaxed italic text-gold-dim">
            {'Khi vẻ đẹp được giữ lại, tình yêu có thêm một lý do để trường tồn.'}
          </p>
          <GoldDivider className="mt-12" />
        </FadeInSection>
      </section>

      <section className="px-6 pb-20 md:pb-28">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-light font-display leading-snug text-balance text-foreground">
              {'Hành trình từ phù du đến vĩnh hằng'}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
              {'Mỗi đóa hồng Nhất Tâm trải qua một cuộc hành trình bốn giai đoạn — từ một bông hoa tươi mong manh thành một biểu tượng vĩnh cửu của tình yêu.'}
            </p>
          </div>
        </FadeInSection>

        <div className="mx-auto max-w-3xl flex flex-col gap-0">
          {processSteps.map((step, i) => (
            <FadeInSection key={step.number} delay={i * 150}>
              <div className="relative flex gap-8 md:gap-12 items-start py-10">
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-3xl md:text-4xl font-display text-gold">
                    {step.number}
                  </span>
                  {i < processSteps.length - 1 && (
                    <div
                      className="mt-4 w-px flex-1 min-h-[40px]"
                      style={{ background: 'linear-gradient(180deg, var(--gold), transparent)' }}
                    />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <h3 className="text-xl md:text-2xl font-display mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      <div
        className="mx-auto max-w-xs h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
      />

      <section className="px-6 py-20 md:py-28">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-light font-display leading-snug text-balance text-foreground">
              {'Vì sao đóa hồng này tồn tại qua năm tháng'}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
              {'Không phải phép thuật. Không phải nhựa nhân tạo. Chỉ là khoa học phục vụ tình yêu.'}
            </p>
          </div>
        </FadeInSection>

        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, i) => (
            <FadeInSection key={reason.title} delay={i * 120}>
              <div className="p-8 border border-gold/10 bg-gold/[0.02] transition-all duration-500 hover:border-gold/30">
                <h3 className="text-lg md:text-xl font-display mb-3 text-foreground">
                  {reason.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      <div
        className="mx-auto max-w-xs h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
      />

      <section className="px-6 py-20 md:py-28">
        <FadeInSection>
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-light font-display leading-snug text-balance text-foreground">
              {'Ý nghĩa của sự bảo tồn'}
            </h2>
            <div className="mx-auto mt-8 max-w-2xl flex flex-col gap-6">
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                {'Một bông hoa tươi đẹp nhưng sẽ tàn. Giống như khoảnh khắc đẹp nhất trong tình yêu — nếu không được gìn giữ, nó sẽ trôi qua và không bao giờ trở lại.'}
              </p>
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                {'Bảo tồn một đóa hồng không phải là chống lại tự nhiên. Đó là một hành động yêu thương — giữ lại điều đẹp đẽ nhất, để nó nhắc nhở bạn mỗi ngày về lý do bạn đã chọn người đó.'}
              </p>
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                {'Mỗi đóa hồng Nhất Tâm là một lời nhắc nhẹ nhàng: tình yêu đáng để được bảo vệ, được nâng niu, và được giữ gìn qua tháng năm.'}
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>

      <section className="px-6 py-20 md:py-28 text-center">
        <FadeInSection>
          <GoldDivider className="mb-14" />
          <div className="max-w-2xl mx-auto">
            <p className="text-2xl md:text-3xl lg:text-4xl font-light font-display leading-relaxed text-gold">
              {'Chúng tôi không giữ hoa sống.'}
            </p>
            <p className="mt-4 text-2xl md:text-3xl lg:text-4xl font-light italic font-display leading-relaxed text-gold">
              {'Chúng tôi giữ lại khoảnh khắc.'}
            </p>
          </div>
          <GoldDivider className="mt-14" />
        </FadeInSection>
      </section>
    </>
  )
}
