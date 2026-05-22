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
        // Remove surrounding quotes if present
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
  console.log("Seeding study plan slots and milestones...");

  for (const user of users) {
    console.log(`\n==========================================`);
    console.log(`Seeding data for user: ${user.name} (${user.id})...`);
    console.log(`==========================================`);

    // 1. Clear existing slots & milestones
    const { error: clearSlotsErr } = await supabase
      .from('study_plan_slots')
      .delete()
      .eq('student_id', user.id);

    if (clearSlotsErr) {
      console.warn(`[WARNING] Could not clear study slots (table might not exist yet):`, clearSlotsErr.message);
    } else {
      console.log("Cleared existing study slots successfully.");
    }

    const { error: clearMilestonesErr } = await supabase
      .from('student_milestones')
      .delete()
      .eq('student_id', user.id);

    if (clearMilestonesErr) {
      console.warn(`[WARNING] Could not clear milestones (table might not exist yet):`, clearMilestonesErr.message);
    } else {
      console.log("Cleared existing milestones successfully.");
    }

    // 2. Define dynamic date strings relative to today
    const today = new Date().toISOString().split('T')[0];
    
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrow = tomorrowObj.toISOString().split('T')[0];

    const dayAfterObj = new Date();
    dayAfterObj.setDate(dayAfterObj.getDate() + 2);
    const dayAfter = dayAfterObj.toISOString().split('T')[0];

    // 3. Seed slots
    const slots = [
      // Today
      {
        student_id: user.id,
        slot_date: today,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Math (Integration Drill)',
        slot_type: 'Practice',
        status: 'completed'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Physics (Rotational Mechanics)',
        slot_type: 'Revision',
        status: 'current'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '04:00 PM - 05:30 PM',
        label: 'Chemistry (Isomerism Notes)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Tomorrow
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Physics (Torque Problems)',
        slot_type: 'Practice',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Chemistry (Coordination Compounds)',
        slot_type: 'Revision',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '06:00 PM - 07:30 PM',
        label: 'Math (Definite Integral)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Day After
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '08:00 AM - 10:00 AM',
        label: 'Full Syllabus Math Mock',
        slot_type: 'Mock',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '03:00 PM - 04:30 PM',
        label: 'Biology (Photosynthesis)',
        slot_type: 'Revision',
        status: 'pending'
      }
    ];

    console.log("Inserting study plan slots...");
    const { data: insertedSlots, error: insertSlotsErr } = await supabase
      .from('study_plan_slots')
      .insert(slots)
      .select();

    if (insertSlotsErr) {
      console.error(`[ERROR] Failed to insert study slots for ${user.name}:`, insertSlotsErr.message);
    } else {
      console.log(`[SUCCESS] Seeded ${insertedSlots.length} study slots for ${user.name}.`);
    }

    // 4. Seed milestones
    const milestones = [
      {
        student_id: user.id,
        text: 'Achieve >85% accuracy in Mechanics topic tests',
        done: false
      },
      {
        student_id: user.id,
        text: 'Complete 10 organic reaction roadmaps',
        done: true
      },
      {
        student_id: user.id,
        text: 'Reduce Rotational Dynamics weakness score below 40',
        done: false
      },
      {
        student_id: user.id,
        text: 'Maintain a 20-day study streak',
        done: true
      }
    ];

    console.log("Inserting milestone targets...");
    const { data: insertedMilestones, error: insertMilestonesErr } = await supabase
      .from('student_milestones')
      .insert(milestones)
      .select();

    if (insertMilestonesErr) {
      console.error(`[ERROR] Failed to insert milestones for ${user.name}:`, insertMilestonesErr.message);
    } else {
      console.log(`[SUCCESS] Seeded ${insertedMilestones.length} milestones for ${user.name}.`);
    }
  }

  console.log("\nSeeding execution finished!");
}

seed();
