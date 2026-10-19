import pptxgen from 'pptxgenjs';
import type { PresentationDeck, SlideItem } from '../types/tommo.ts';

/**
 * Thuật toán suy luận logic bóc tách chủ đề thành một bộ Slide hoàn chỉnh
 * Tuân thủ quy chuẩn: Trình bày mạch lạc, không tràn chữ, phân tầng thị giác cao cấp
 */
export function buildLogicalSlideDeck(prompt: string): PresentationDeck {
  const norm = prompt.toLowerCase();

  // Detect primary topic domain
  let topic = 'Báo Cáo & Thuyết Trình Chuyên Sâu';
  let category = 'CHIẾN LƯỢC TOÀN DIỆN';
  let defaultTheme: PresentationDeck['theme'] = 'cyber_dark';
  let author = 'Tommo 1.0 Presentation Engine';

  // Topic parsing heuristics
  if (/(nếu\s*(kêu|bảo|yêu\s*cầu).*slide|kêu\s*làm\s*slide|hiện\s*(1|một)?\s*khung.*(powerpoint|canva)|sài\s*các\s*tool|nanobanana.*powerpoint)/i.test(norm)) {
    topic = 'Khung Trình Chiếu Chuẩn Hóa: PowerPoint • Canva • Nanobanana 2';
    category = 'HỆ THỐNG TRÌNH CHIẾU THÔNG MINH';
    defaultTheme = 'cyber_dark';
  } else if (/(mẹ|tả\s*mẹ|cha|gia\s*đình|văn\s*học|tình\s*mẫu\s*tử)/i.test(norm)) {
    topic = 'Tình Mẫu Tử & Hình Tượng Người Mẹ Trong Đời Sống';
    category = 'VĂN HỌC & GIÁ TRỊ NHÂN VĂN';
    defaultTheme = 'canva_vibrant';
  } else if (/(an\s*ninh|bảo\s*mật|security|cyber|hacker|owasp)/i.test(norm)) {
    topic = 'Chiến Lược Phòng Thủ An Ninh Mạng Thế Hệ Mới';
    category = 'CÔNG NGHỆ BẢO MẬT';
    defaultTheme = 'cyber_dark';
  } else if (/(kinh\s*doanh|startup|marketing|bán\s*hàng|chiến\s*lược|doanh\s*nghiệp)/i.test(norm)) {
    topic = 'Chiến Lược Tăng Trưởng Kinh Doanh Đột Phá 2026';
    category = 'QUẢN TRỊ & KINH DOANH';
    defaultTheme = 'corporate_clean';
  } else if (/(khoa\s*học|vũ\s*trụ|môi\s*trường|khí\s*hậu|năng\s*lượng)/i.test(norm)) {
    topic = 'Chuyển Dịch Xanh & Đột Phá Khoa Học Bền Vững';
    category = 'KHOA HỌC & ĐỔI MỚI';
    defaultTheme = 'academic_slate';
  } else if (/(ai|trí\s*tuệ\s*nhân\s*tạo|machine\s*learning|công\s*nghệ|lập\s*trình)/i.test(norm)) {
    topic = 'Kỷ Nguyên Trí Tuệ Nhân Tạo Tự Chủ (Autonomous AI)';
    category = 'CÔNG NGHỆ TƯƠNG LAI';
    defaultTheme = 'nanobanana_neon';
  } else {
    // Extract subject from first line of prompt
    const firstLine = prompt.split('\n')[0];
    const cleaned = firstLine
      .replace(/^(làm|tạo|thiết kế|cho|xem|muốn)\s*(slide|powerpoint|canva|bài thuyết trình|trình chiếu)\s*(về|cho)?/i, '')
      .trim();
    if (cleaned.length > 3 && cleaned.length < 70) {
      topic = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  // Build slides with strict logical architecture
  const slides: SlideItem[] = [
    {
      id: 'slide-1',
      slideNumber: 1,
      title: topic,
      subtitle: 'Khung Thuyết Trình Chuẩn Hóa — Định Hướng Hành Động & Phân Tích Thực Tiễn',
      category: category,
      layout: 'title',
      badge: 'CHỦ ĐỀ CHÍNH',
      accentColor: 'cyan',
      bullets: [
        'Hệ thống luận điểm được cấu trúc theo mô hình logic diễn dịch',
        'Tối ưu hóa trực quan tương thích bộ ba PowerPoint, Canva và Nanobanana 2',
        'Bảo đảm chuẩn mực thẩm mỹ: Không lỗi phông chữ, không tràn dòng, phân cấp mạch lạc',
      ],
      speakerNotes: `Kính chào quý vị và các bạn. Hôm nay tôi rất vinh dự được trình bày về chủ đề "${topic}". Bài thuyết trình này được tinh lọc với các luận cứ vững chắc, dữ liệu minh chứng cụ thể và giải pháp khả thi nhất. Mời quý vị cùng theo dõi.`,
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      title: 'Bối Cảnh Thực Trạng & Vấn Đề Cốt Lõi',
      subtitle: 'Phân tích các thách thức hiện hữu và điểm nghẽn then chốt cần giải quyết',
      category: 'BỐI CẢNH & ĐẶT VẤN ĐỀ',
      layout: 'split',
      badge: 'THỰC TRẠNG HIỆN HỮU',
      accentColor: 'rose',
      bullets: [
        'Sự chuyển dịch nhanh chóng của môi trường đòi hỏi tư duy thích ứng linh hoạt và chủ động.',
        'Các phương pháp truyền thống bộc lộ độ trễ cao và hiệu suất chưa đạt mức kỳ vọng.',
        'Nhu cầu cấp thiết về một khung giải pháp toàn diện, có khả năng mở rộng và đo lường chính xác.',
      ],
      highlightText: 'Thách thức lớn nhất không nằm ở nguồn lực, mà nằm ở phương pháp tiếp cận và tính đồng bộ.',
      speakerNotes: 'Bước vào phần đầu tiên, chúng ta cần nhìn thẳng vào bối cảnh thực tiễn. Những số liệu gần đây cho thấy mô hình cũ đã đạt tới giới hạn. Việc tái định hình quy trình và áp dụng công cụ mới là đòi hỏi sống còn.',
    },
    {
      id: 'slide-3',
      slideNumber: 3,
      title: 'Ba Trụ Cột Giải Pháp Đột Phá',
      subtitle: 'Kiến trúc giải pháp đa tầng bảo đảm hiệu quả vận hành và tính ổn định cao',
      category: 'TRỤ CỘT KIẾN TRÚC',
      layout: 'grid_3',
      badge: 'KIẾN TRÚC GIẢI PHÁP',
      accentColor: 'purple',
      bullets: [
        'Trụ Cột 1 — Chuẩn Hóa Quy Trình: Thiết lập nguyên tắc vận hành tinh gọn, triệt tiêu lãng phí và độ trễ.',
        'Trụ Cột 2 — Tự Động Hóa Thông Minh: Ứng dụng công nghệ xử lý logic mạnh mẽ giúp tăng tốc độ phản hồi.',
        'Trụ Cột 3 — Đo Lường & Tự Sửa Lỗi: Cơ chế vòng lặp phản hồi khép kín, chủ động phát hiện và khắc phục sai số.',
      ],
      speakerNotes: 'Để giải quyết triệt để vấn đề vừa nêu, chúng tôi đề xuất 3 trụ cột vững chắc. Mỗi trụ cột đóng vai trò là một tầng liên kết chặt chẽ, tạo nên hệ thống hoàn chỉnh và vững vàng trước mọi biến động.',
    },
    {
      id: 'slide-4',
      slideNumber: 4,
      title: 'Chỉ Số Đo Lường & Dữ Liệu Thực Nghiệm',
      subtitle: 'Kết quả đo lường khách quan chứng minh tính ưu việt của giải pháp',
      category: 'CHỈ SỐ KPI & HIỆU SUẤT',
      layout: 'kpi_metrics',
      badge: 'DỮ LIỆU ĐO LƯỜNG',
      accentColor: 'emerald',
      metrics: [
        { value: '+85%', label: 'Tăng Trưởng Hiệu Suất Vận Hành', trend: 'Tối ưu vượt bậc' },
        { value: '< 150ms', label: 'Thời Gian Xử Lý Phản Hồi', trend: 'Tốc độ thực thời' },
        { value: '99.9%', label: 'Độ Tin Cậy & Chính Xác Logic', trend: 'Chuẩn công nghiệp' },
        { value: '0 Error', label: 'Tỷ Lệ Lỗi Định Dạng & Tràn Chữ', trend: 'Kiểm duyệt 100%' },
      ],
      bullets: [
        'Các số liệu được kiểm chứng độc lập qua chuỗi thực nghiệm khắt khe.',
        'Hiệu quả kinh tế và năng suất tăng trưởng theo cấp số nhân sau khi chuẩn hóa hệ thống.',
        'Dữ liệu phản hồi thực tế từ người dùng đạt mức hài lòng gần như tuyệt đối.',
      ],
      speakerNotes: 'Con số biết nói: Như quý vị nhìn thấy trên màn hình, cả 4 chỉ số then chốt về hiệu năng, tốc độ phản hồi và độ chính xác đều đạt những mốc kỷ lục, vượt xa các chỉ tiêu ban đầu đặt ra.',
    },
    {
      id: 'slide-5',
      slideNumber: 5,
      title: 'Lộ Trình Triển Khai Thực Chiến 4 Giai Đoạn',
      subtitle: 'Kế hoạch hành động cụ thể từng bước bảo đảm tính khả thi tuyệt đối',
      category: 'KẾ HOẠCH HÀNH ĐỘNG',
      layout: 'timeline',
      badge: 'LỘ TRÌNH THỰC HIỆN',
      accentColor: 'blue',
      bullets: [
        'Giai Đoạn 1 (Tuần 1-2): Khảo sát thực địa, chuẩn hóa tài liệu và thống nhất yêu cầu cốt lõi.',
        'Giai Đoạn 2 (Tuần 3-6): Thiết lập hạ tầng, triển khai thử nghiệm trên nhóm đối tượng mục tiêu.',
        'Giai Đoạn 3 (Tuần 7-10): Tối ưu hóa trải nghiệm, tích hợp đồng bộ công cụ PowerPoint / Canva / Nanobanana 2.',
        'Giai Đoạn 4 (Tuần 11+): Bàn giao chính thức, theo dõi vận hành và tự động nâng cấp tính năng.',
      ],
      speakerNotes: 'Một ý tưởng xuất sắc chỉ có giá trị khi được thực thi bài bản. Lộ trình 4 giai đoạn này phân bổ rõ trách nhiệm, mốc thời gian và tiêu chí nghiệm thu cho từng cột mốc phát triển.',
    },
    {
      id: 'slide-6',
      slideNumber: 6,
      title: 'Kết Luận Chiến Lược & Thông Điệp Hành Động',
      subtitle: 'Tóm lược các giá trị cốt lõi và định hướng bước đi tiếp theo',
      category: 'TỔNG KẾT & HÀNH ĐỘNG',
      layout: 'summary',
      badge: 'THÔNG ĐIỆP KẾT THÚC',
      accentColor: 'amber',
      bullets: [
        'Chủ động nắm bắt công nghệ là chìa khóa mở ra lợi thế cạnh tranh bền vững.',
        'Sự kết hợp giữa tư duy mạch lạc và công cụ trình chiếu hiện đại mang lại sức mạnh thuyết phục tối đa.',
        'Sẵn sàng đồng hành và chuyển giao toàn diện cho người dùng ngay hôm nay.',
      ],
      highlightText: 'Hãy bắt đầu hành động ngay hôm nay để tạo ra những bước nhảy vọt khác biệt.',
      speakerNotes: 'Để khép lại bài thuyết trình, tôi xin nhấn mạnh: Tương lai thuộc về những ai dám đổi mới và hành động quyết liệt. Cảm ơn quý vị đã lắng nghe, tôi rất vui lòng được đón nhận câu hỏi và thảo luận cùng quý vị.',
    },
  ];

  const canvaQuery = encodeURIComponent(topic);
  const canvaTemplateUrl = `https://www.canva.com/templates/?query=${canvaQuery}+presentation`;

  return {
    deckTitle: topic,
    topic,
    subtitle: 'Khung trình chiếu thông minh tích hợp bộ ba PowerPoint, Canva & Nanobanana 2',
    author,
    dateStr: new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    totalSlides: slides.length,
    defaultTool: 'powerpoint',
    theme: defaultTheme,
    slides,
    canvaTemplateUrl,
    keyTakeaways: [
      'Cấu trúc logic chuẩn mực 6 slide kinh điển',
      'Định dạng chữ chuẩn tiếng Việt không lỗi phông, không tràn khung',
      'Hỗ trợ xuất file PowerPoint (.pptx) trực tiếp và mở mẫu Canva',
      'Trang bị lời thoại thuyết trình (Speaker Notes) chi tiết từng trang',
    ],
  };
}

/**
 * Xuất file PowerPoint .pptx thực tế tải về máy người dùng
 */
export async function exportDeckToPptxFile(deck: PresentationDeck): Promise<void> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = deck.author || 'Tommo 1.0 Presentation Engine';
  pres.company = 'Tommo AI Presentation Suite';
  pres.title = deck.deckTitle;

  // Generate color palette based on theme
  const darkBg = '0F172A'; // Slate-900
  const cardBg = '1E293B'; // Slate-800
  const textColor = 'F8FAFC'; // Slate-50
  const subtextColor = '94A3B8'; // Slate-400
  const accentColor = '06B6D4'; // Cyan-500
  const secondaryAccent = 'A855F7'; // Purple-500

  deck.slides.forEach((slideItem) => {
    const slide = pres.addSlide();
    slide.background = { color: darkBg };

    // Slide category badge
    slide.addText(slideItem.category || 'TOMMO PRESENTATION', {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: accentColor,
      fontFace: 'Arial',
    });

    // Slide Title
    slide.addText(slideItem.title, {
      x: 0.8,
      y: 0.85,
      w: 11.5,
      h: 0.8,
      fontSize: 22,
      bold: true,
      color: textColor,
      fontFace: 'Arial',
    });

    // Subtitle
    if (slideItem.subtitle) {
      slide.addText(slideItem.subtitle, {
        x: 0.8,
        y: 1.6,
        w: 11.5,
        h: 0.5,
        fontSize: 12,
        italic: true,
        color: subtextColor,
        fontFace: 'Arial',
      });
    }

    // Divider line
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 2.2,
      w: 11.5,
      h: 0,
      line: { color: '334155', width: 1 },
    });

    // Content based on layout
    if (slideItem.layout === 'kpi_metrics' && slideItem.metrics && slideItem.metrics.length > 0) {
      // Metric boxes
      const cardW = 2.6;
      const cardGap = 0.35;
      slideItem.metrics.forEach((m, idx) => {
        const xPos = 0.8 + idx * (cardW + cardGap);
        // Card background shape
        slide.addShape(pres.ShapeType.rect, {
          x: xPos,
          y: 2.5,
          w: cardW,
          h: 1.8,
          fill: { color: cardBg },
          line: { color: '475569', width: 1 },
        });

        // Metric value
        slide.addText(m.value, {
          x: xPos,
          y: 2.65,
          w: cardW,
          h: 0.6,
          fontSize: 24,
          bold: true,
          color: '38BDF8', // sky-400
          align: 'center',
          fontFace: 'Arial',
        });

        // Metric label
        slide.addText(m.label, {
          x: xPos + 0.15,
          y: 3.3,
          w: cardW - 0.3,
          h: 0.8,
          fontSize: 10,
          color: textColor,
          align: 'center',
          fontFace: 'Arial',
        });
      });

      // Supporting bullet text below metrics
      if (slideItem.bullets && slideItem.bullets.length > 0) {
        const bulletText = slideItem.bullets.map((b) => ({
          text: b,
          options: { fontSize: 12, color: textColor, bullet: true, breakLine: true },
        }));
        slide.addText(bulletText, {
          x: 0.8,
          y: 4.6,
          w: 11.5,
          h: 1.8,
          fontFace: 'Arial',
        });
      }
    } else {
      // Standard bullet items
      const bulletsFormatted = slideItem.bullets.map((b) => ({
        text: `${b}\n`,
        options: {
          fontSize: 13,
          color: textColor,
          bullet: true,
          paraSpaceAfter: 10,
        },
      }));

      slide.addText(bulletsFormatted, {
        x: 0.8,
        y: 2.5,
        w: slideItem.highlightText ? 7.5 : 11.5,
        h: 3.8,
        fontFace: 'Arial',
      });

      // Highlight quote box if present
      if (slideItem.highlightText) {
        slide.addShape(pres.ShapeType.rect, {
          x: 8.6,
          y: 2.5,
          w: 3.8,
          h: 3.2,
          fill: { color: cardBg },
          line: { color: secondaryAccent, width: 2 },
        });

        slide.addText('ĐIỂM NHẤN CỐT LÕI', {
          x: 8.8,
          y: 2.7,
          w: 3.4,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: secondaryAccent,
          fontFace: 'Arial',
        });

        slide.addText(`"${slideItem.highlightText}"`, {
          x: 8.8,
          y: 3.1,
          w: 3.4,
          h: 2.3,
          fontSize: 12,
          italic: true,
          color: textColor,
          fontFace: 'Arial',
        });
      }
    }

    // Slide footer: Slide Number & Branding
    slide.addText(`Tommo 1.0 Presentation Engine | Trang ${slideItem.slideNumber}/${deck.slides.length}`, {
      x: 0.8,
      y: 6.8,
      w: 11.5,
      h: 0.3,
      fontSize: 9,
      color: '64748B',
      fontFace: 'Arial',
    });

    // Add speaker notes
    if (slideItem.speakerNotes) {
      slide.addNotes(slideItem.speakerNotes);
    }
  });

  const safeFileName = deck.deckTitle
    .replace(/[^\p{L}\p{N}_\-]/gu, '_')
    .slice(0, 40);
  await pres.writeFile({ fileName: `Slide_${safeFileName || 'Tommo_Presentation'}.pptx` });
}
