const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Pure JavaScript parser for .env.local (zero-dependency)
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users = [
  { id: '7244a679-958d-4a61-b6b0-b8d2356d0744', name: 'reddy' },
  { id: 'b2953638-63ce-4bbf-a2af-4b207d775983', name: 'bharath' }
];

async function seed() {
  console.log("Seeding Analytics Data...");

  // 1. Fetch some topics to use for topic progress
  const { data: topics, error: topicErr } = await supabase.from('topics').select('id, name, subject_id').limit(10);
  if (topicErr || !topics || topics.length === 0) {
    console.error("Could not fetch topics. Ensure you have topics seeded first.", topicErr?.message);
    process.exit(1);
  }

  // 2. Create a dummy quiz to link attempts to
  const { data: quiz, error: quizErr } = await supabase
    .from('quizzes')
    .insert([{ title: 'Mock Drill', duration_minutes: 30, total_marks: 100, exam_track: 'jee' }])
    .select('id')
    .single();

  if (quizErr) {
    console.error("Could not create dummy quiz:", quizErr.message);
    process.exit(1);
  }

  const quizId = quiz.id;

  for (const user of users) {
    console.log(`\n==========================================`);
    console.log(`Seeding analytics for: ${user.name} (${user.id})...`);
    console.log(`==========================================`);

    // --- DAILY PROGRESS ---
    // Clear old
    await supabase.from('daily_progress').delete().eq('student_id', user.id);

    const dailyProgress = [];
    let currentStreak = 18;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      dailyProgress.push({
        student_id: user.id,
        progress_date: dateStr,
        study_minutes: 40 + Math.floor(Math.random() * 80), // 40-120 mins
        questions_attempted: 20 + Math.floor(Math.random() * 30),
        questions_correct: 15 + Math.floor(Math.random() * 20),
        quizzes_completed: i % 2 === 0 ? 1 : 0,
        streak_count: currentStreak - i,
        readiness_score: 60 + Math.floor(Math.random() * 20)
      });
    }

    const { error: dpErr } = await supabase.from('daily_progress').insert(dailyProgress);
    if (dpErr) console.error("Error inserting daily_progress:", dpErr.message);
    else console.log("Inserted daily_progress.");

    // --- QUIZ ATTEMPTS ---
    await supabase.from('quiz_attempts').delete().eq('student_id', user.id);
    
    const attempts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      attempts.push({
        quiz_id: quizId,
        student_id: user.id,
        status: 'submitted',
        score: 60 + Math.floor(Math.random() * 40),
        accuracy: 70 + Math.floor(Math.random() * 25),
        time_spent_seconds: 1200 + Math.floor(Math.random() * 600),
        submitted_at: d.toISOString()
      });
    }

    const { error: qaErr } = await supabase.from('quiz_attempts').insert(attempts);
    if (qaErr) console.error("Error inserting quiz_attempts:", qaErr.message);
    else console.log("Inserted quiz_attempts.");

    // --- STUDENT TOPIC PROGRESS ---
    await supabase.from('student_topic_progress').delete().eq('student_id', user.id);
    
    const topicProgress = [];
    for (let i = 0; i < Math.min(5, topics.length); i++) {
      topicProgress.push({
        student_id: user.id,
        topic_id: topics[i].id,
        mastery_score: 50 + Math.floor(Math.random() * 40),
        weakness_score: i === 0 || i === 2 ? 60 + Math.floor(Math.random() * 30) : 20 + Math.floor(Math.random() * 20),
        accuracy: 40 + Math.floor(Math.random() * 50),
        attempts_count: 5,
        correct_count: 3
      });
    }

    const { error: tpErr } = await supabase.from('student_topic_progress').insert(topicProgress);
    if (tpErr) console.error("Error inserting student_topic_progress:", tpErr.message);
    else console.log("Inserted student_topic_progress.");

  }

  console.log("\nSeeding execution finished!");
}

seed();
