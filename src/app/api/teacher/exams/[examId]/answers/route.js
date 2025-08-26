export async function POST(req) {
  try {
    const data = await req.json();
    const { type, title, pdf_url, image_url, questions, class_id } = data;

    if (!title || !type) {
      return NextResponse.json({ error: 'عنوان و نوع آزمون الزامی است' }, { status: 400 });
    }
    if (!class_id || isNaN(Number(class_id))) {
      return NextResponse.json({ error: 'کلاس آزمون الزامی است' }, { status: 400 });
    }

    let exam;
    if (type === 'pdf') {
      if (!pdf_url) return NextResponse.json({ error: 'فایل PDF الزامی است' }, { status: 400 });
      exam = await prisma.exams.create({
        data: { 
          title, 
          type, 
          pdf_url,
          class_id: Number(class_id),
          duration_minutes: 60,
          total_marks: 100
        }
      });
    } else if (type === 'image') {
      if (!image_url) return NextResponse.json({ error: 'تصویر آزمون الزامی است' }, { status: 400 });
      exam = await prisma.exams.create({
        data: { 
          title, 
          type, 
          image_url,
          class_id: Number(class_id),
          duration_minutes: 60,
          total_marks: 100
        }
      });
    } else if (type === 'quiz') {
      exam = await prisma.exams.create({
        data: { 
          title, 
          type,
          questions: questions ? JSON.stringify(questions) : undefined,
          class_id: Number(class_id),
          duration_minutes: 60,
          total_marks: 100
        }
      });

      // ثبت سوالات و گزینه‌ها در جداول استاندارد
      if (questions && Array.isArray(questions)) {
        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const q = questions[qIdx];
          // ثبت سوال در exam_questions
          const examQuestion = await prisma.exam_questions.create({
            data: {
              exam_id: exam.id,
              question_text: q.question,
              question_type: "multiple_choice",
              marks: 1,
              sort_order: qIdx
            }
          });
          // ثبت گزینه‌ها در question_options
          for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
            await prisma.question_options.create({
              data: {
                question_id: examQuestion.id,
                option_text: q.options[oIdx],
                is_correct: oIdx === q.answer,
                sort_order: oIdx
              }
            });
          }
        }
      }
    } else {
      return NextResponse.json({ error: 'نوع آزمون نامعتبر است' }, { status: 400 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error('ثبت آزمون error:', error?.message, error?.stack);
    return NextResponse.json({ 
      error: 'خطا در ثبت آزمون', 
      detail: error.message 
    }, { status: 500 });
  }
}