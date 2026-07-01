import { Lesson } from './types';

// Let's create the curriculum database for Grades R, 1, 2, and 3
export const CURRICULUM_LESSONS: Lesson[] = [
  // --- GRADE R ---
  // TERM 1
  {
    id: 'R-T1-W1',
    grade: 'R',
    term: 1,
    week: 1,
    strand: 'Digital',
    title: 'How to Keep Devices Safe',
    capsCode: ['D.4'],
    description: 'Learn the rules and guidelines for keeping computing devices safe, such as keeping them dry and far from food.',
    highlights: ['Learn safe-use guidelines for devices', 'Keep devices dry and sit properly', 'No eating while using devices'],
    suggestedActivity: 'Identify safe and unsafe behaviors when using digital devices.',
    activityType: 'digital'
  },
  {
    id: 'R-T1-W2',
    grade: 'R',
    term: 1,
    week: 2,
    strand: 'Coding',
    title: 'Rudimentary Patterns',
    capsCode: ['C.6'],
    description: 'Identify, complete and replicate simple repeating red/blue color patterns physically.',
    highlights: ['Recognize pattern rules', 'Replicate patterns with beads/blocks', 'Introduction to repeating structures'],
    suggestedActivity: 'Arrange red and blue blocks in ABAB sequence.',
    activityType: 'pattern'
  },
  {
    id: 'R-T1-W3',
    grade: 'R',
    term: 1,
    week: 3,
    strand: 'Digital',
    title: 'Devices Around the World',
    capsCode: ['D.3'],
    description: 'Learn about different electronic computing devices, such as smartphones, laptops, and microwaves.',
    highlights: ['Interactive device sorting game', 'Identify electronic devices', 'Understand computing machines around us'],
    suggestedActivity: 'Identify electronic computing devices.',
    activityType: 'digital'
  },
  {
    id: 'R-T1-W4',
    grade: 'R',
    term: 1,
    week: 4,
    strand: 'Coding',
    title: 'Picture Stories — Beginning, Middle and End',
    capsCode: ['C.1', 'C.3'],
    description: 'Arrange everyday activity cards in logical sequence (Begin, Middle, End), such as washing hands or brushing teeth.',
    highlights: ['Learn that order matters', 'Identify start, middle, and ending steps', 'Understand simple sequences'],
    suggestedActivity: 'Place 3 steps of washing hands in order.',
    activityType: 'sequence'
  },
  {
    id: 'R-T1-W5',
    grade: 'R',
    term: 1,
    week: 5,
    strand: 'Coding',
    title: 'Introduction to Arrow Cards',
    capsCode: ['C.1', 'C.3'],
    description: 'Introduction to command sequence using directional arrows (Up, Down, Left, Right). Implied auto-facing of the character.',
    highlights: ['ONE arrow moves character until hitting a wall', 'Auto-turning is implied', 'Unplugged floor grid practice'],
    suggestedActivity: 'Move Sipho Super Bunny to the carrot sequentially.',
    activityType: 'grid'
  },
  {
    id: 'R-T1-W6',
    grade: 'R',
    term: 1,
    week: 6,
    strand: 'Robotics',
    title: 'What is a Robot?',
    capsCode: ['R.1'],
    description: 'Understand that a robot is a machine made by humans that follows instruction cards to do tasks.',
    highlights: ['Difference between a human and a robot', 'Robots require instructions', 'Robots help with dangerous or repetitive work'],
    suggestedActivity: 'Review pictures of industrial and home cleaning robots.',
    activityType: 'robotics'
  },
  {
    id: 'R-T1-W7',
    grade: 'R',
    term: 1,
    week: 7,
    strand: 'Robotics',
    title: 'Baby Bot Code Cards',
    capsCode: ['R.6', 'C.3'],
    description: 'Use a set of arrow code cards on a grid to guide Baby Bot to its milk bottle.',
    highlights: ['Act as a robot following instructions', 'Debug instructions to find the correct set', 'Each arrow translates to movement until blocked'],
    suggestedActivity: 'Test the 3 sets of instructions to find the bottle on the grid.',
    activityType: 'grid'
  },
  {
    id: 'R-T1-W8',
    grade: 'R',
    term: 1,
    week: 8,
    strand: 'Robotics',
    title: 'Beaded Bracelet Designer',
    capsCode: ['R.5', 'C.6'],
    description: 'Learn to design a simple beaded bracelet by identifying, following, and creating repeating patterns.',
    highlights: ['Identify repeating color patterns', 'Design a beaded bracelet using specifications', 'Create and test custom color-sequence patterns'],
    suggestedActivity: 'Identify pattern sequence, then choose correct beads to design a patterned bracelet.',
    activityType: 'robotics'
  },
  {
    id: 'R-T1-W9',
    grade: 'R',
    term: 1,
    week: 9,
    strand: 'Coding',
    title: 'Drum Pad Rhythm Patterns',
    capsCode: ['C.6'],
    description: 'Identify, copy and continue simple auditory and body percussion rhythm patterns (drumming and clapping).',
    highlights: ['Auditory repeating patterns', 'Drum pad and clapping patterns', 'Extend repeating beats'],
    suggestedActivity: 'Replicate auditory percussion rhythms like Drum, Clap, Drum, Clap.',
    activityType: 'pattern'
  },
  {
    id: 'R-T1-W10',
    grade: 'R',
    term: 1,
    week: 10,
    strand: 'Coding',
    title: 'Revision & Celebration',
    capsCode: ['C.1', 'C.3', 'R.1', 'D.3'],
    description: 'Review pattern sorting, computer device recognition, and 3-step grid coding.',
    highlights: ['Receive Term 1 Star Badge', 'Consolidate sequence thinking', 'Celebrate robot mimicking success'],
    suggestedActivity: 'Solve a mixed grid puzzle and pattern match to checkout.',
    activityType: 'exploration'
  },

  // TERM 2, 3, 4 summarized / compiled as key topics for R
  {
    id: 'R-T2-W5',
    grade: 'R',
    term: 2,
    week: 5,
    strand: 'Robotics',
    title: 'Identify Different Robots',
    capsCode: ['R.2'],
    description: 'Identify domestic (vacuum cleaner), industrial (car factory), and educational (Scratch Jr) robots.',
    highlights: ['Group robots by their workplace', 'Recognize robot vacuums on standard carpets', 'Robot designs'],
    suggestedActivity: 'Sort robots into domestic home robots or industrial factories.',
    activityType: 'robotics'
  },
  {
    id: 'R-T3-W5',
    grade: 'R',
    term: 3,
    week: 5,
    strand: 'Robotics',
    title: 'Moving Parts & Sensors',
    capsCode: ['R.3'],
    description: 'Explain that robots have moving parts (arms, legs, wheels) and sensors (eyes/cameras) to perceive the world.',
    highlights: ['Robots require physical parts to move', 'Sensors perceive light, objects, and collisions', 'Connect sensors to reactions'],
    suggestedActivity: 'Interactive assembly matching moving arms to light sensors.',
    activityType: 'robotics'
  },
  {
    id: 'R-T4-W2',
    grade: 'R',
    term: 4,
    week: 2,
    strand: 'Digital',
    title: 'Digital Citizenship & Screentime',
    capsCode: ['D.2'],
    description: 'Learn about screen time guidelines, online safety, and protecting personal information.',
    highlights: ['Balance screentime with physical outdoor play', 'Do not share personal credentials with strangers online', 'Always ask parents before accessing new web levels'],
    suggestedActivity: 'Complete screen safety scenario answers.',
    activityType: 'digital'
  },
  {
    id: 'R-T4-W5',
    grade: 'R',
    term: 4,
    week: 5,
    strand: 'Robotics',
    title: 'Design a Simple Robot',
    capsCode: ['R.5'],
    description: 'Design a robot from recycled materials (box, straws, paper pins) to perform a specific helpers role.',
    highlights: ['Ideation of helper robots', 'Use cardboard, strings, and toilet rolls', 'Simulating virtual robot assembly'],
    suggestedActivity: 'Arrange digital splits/straws to model a virtual robot.',
    activityType: 'robotics'
  },

  // --- GRADE 1 ---
  // TERM 1
  {
    id: '1-T1-W1',
    grade: '1',
    term: 1,
    week: 1,
    strand: 'Coding',
    title: 'Elementary Repeating Patterns',
    capsCode: ['C.6'],
    description: 'Describe and extend repeating patterns consisting of 3 separate elements (fruits, colors, shapes).',
    highlights: ['A-B-C repeating sequences', 'Count skipping rules (+1)', 'Predict which item comes next in the line'],
    suggestedActivity: 'Identify rule for: Yellow, Pink, Yellow, Pink...',
    activityType: 'pattern'
  },
  {
    id: '1-T1-W2',
    grade: '1',
    term: 1,
    week: 2,
    strand: 'Digital',
    title: 'What is a Computing Device?',
    capsCode: ['D.3'],
    description: 'Learn what a computing device is, name everyday devices, and trace computer parts.',
    highlights: ['Say "COMPUTING DEVICE" out loud', 'Interactive Input-Processing-Output map flow', 'Workbook trace: laptops and desktop computers'],
    suggestedActivity: 'Circle the computing device; trace and write digital vocabulary.',
    activityType: 'digital'
  },
  {
    id: '1-T1-W5',
    grade: '1',
    term: 1,
    week: 5,
    strand: 'Coding',
    title: 'Sequence Lengths and Implied Turns',
    capsCode: ['C.1', 'C.3'],
    description: 'Develop longer command sequences on the grid. Turning is still implied, but boundaries are tighter.',
    highlights: ['Build 5+ instruction sequences', 'Dodge brick walls block-by-block', 'Test your script and watch the character move'],
    suggestedActivity: 'Draft code to bypass rock obstacles sequentially.',
    activityType: 'grid'
  },
  // TERM 2
  {
    id: '1-T2-W5',
    grade: '1',
    term: 2,
    week: 5,
    strand: 'Coding',
    title: 'Repetition and Loops (Numbers Below Arrows)',
    capsCode: ['C.2', 'C.3'],
    description: 'Introduce loops! A number written below an arrow specifies the repeat count (e.g., Forward x3).',
    highlights: ['Shorten sequence arrays recursively', 'Avoid writing Forward-Forward-Forward', 'Perform tasks in fewer cards'],
    suggestedActivity: 'Write Forward with a 3 below to move SSB forward 3 blocks.',
    activityType: 'grid'
  },
  {
    id: '1-T2-W9',
    grade: '1',
    term: 2,
    week: 9,
    strand: 'Robotics',
    title: 'Types of Robots & Domestic Uses',
    capsCode: ['R.2', 'D.4'],
    description: 'Deconstruct robot vacuums, assembly arms, and explore their benefits in modern households.',
    highlights: ['Discover battery charging and docking', 'Analyze wheels, bumper guards, and sensors', 'Explain why robots make cleaning easier'],
    suggestedActivity: 'Match vacuum parts with their functions.',
    activityType: 'robotics'
  },
  // TERM 3
  {
    id: '1-T3-W2',
    grade: '1',
    term: 3,
    week: 2,
    strand: 'Digital',
    title: 'Hardware vs Software Application',
    capsCode: ['D.5'],
    description: 'Identify hardware as physical components you can touch and software as intangible Apps inside.',
    highlights: ['Touch screen/mouse/keyboard = Hardware', 'Gaming/drawing/math Apps = Software', 'Explain how software coordinates hardware actions'],
    suggestedActivity: 'Drag files and items into the Hardware or Software bins.',
    activityType: 'digital'
  },
  {
    id: '1-T3-W5',
    grade: '1',
    term: 3,
    week: 5,
    strand: 'Coding',
    title: 'Debugging Simple Coding Errors',
    capsCode: ['C.1', 'C.2', 'C.4'],
    description: 'Identify and fix bugs in a given pathing sequence where Sipho Super Bunny fails to find the carrot.',
    highlights: ['Analyze failing sequences step-by-step', 'Spot missing turns or excess forwards', 'Substitute with updated commands'],
    suggestedActivity: 'Fix a sequence of 4 blocks that terminates in a sand obstacle.',
    activityType: 'grid'
  },
  // TERM 4
  {
    id: '1-T4-W2',
    grade: '1',
    term: 4,
    week: 2,
    strand: 'Digital',
    title: 'Emoji Secret Code Generator',
    capsCode: ['D.8', 'D.9'],
    description: 'Translate simple words into coded patterns using standard emojis and deciphers.',
    highlights: ['Understand letters mapping to symbolic keys', 'Decode a 3-word secret phrase', 'Write names in coded symbols'],
    suggestedActivity: 'Translate the emoji array back to English text.',
    activityType: 'digital'
  },
  {
    id: '1-T4-W5',
    grade: '1',
    term: 4,
    week: 5,
    strand: 'Robotics',
    title: 'String-Pull Robot Assembler',
    capsCode: ['R.5'],
    description: 'Learn robot hand movements and model virtual puppet arms using straws and cords.',
    highlights: ['Construct cardboard joint motions', 'Explore leverage, pivot points, and pull strings', 'Direct puppet motions with coding blocks'],
    suggestedActivity: 'Manipulate virtual string points to make robot hand gesture.',
    activityType: 'robotics'
  },

  // --- GRADE 2 ---
  // TERM 1
  {
    id: '2-T1-W1',
    grade: '2',
    term: 1,
    week: 1,
    strand: 'Coding',
    title: 'Completing Complex Patterns',
    capsCode: ['C.6', 'C.7'],
    description: 'Extend growing patterns and compound loops (A-B-B-A-B-B) and decipher bracelet mappings.',
    highlights: ['Multi-element repeat limits', 'Identify core repeating clusters', 'Identify patterns on grid tables'],
    suggestedActivity: 'Match a straight multi-color line sequence with its correct bracelet equivalent.',
    activityType: 'pattern'
  },
  {
    id: '2-T1-W5',
    grade: '2',
    term: 1,
    week: 5,
    strand: 'Coding',
    title: 'Explicit Turning (The Game Changer!)',
    capsCode: ['C.1', 'C.2', 'C.3'],
    description: 'CRITICAL GRADE 2 FEATURE: Arrow instructions: Forward moves 1 block. Character NO LONGER auto-turns! Explicit Turns required to face direction.',
    highlights: ['Turn Left/Right rotates the sprite in place', 'Character remains in current block when turning', 'Forward command required next to move'],
    suggestedActivity: 'Navigate the butterfly to the flower with explicit rotating nodes.',
    activityType: 'grid'
  },
  // TERM 2
  {
    id: '2-T2-W5',
    grade: '2',
    term: 2,
    week: 5,
    strand: 'Coding',
    title: 'The Conditional IF-THEN Block',
    capsCode: ['C.2', 'C.3', 'C.4'],
    description: 'Introduce Decision constructs! IF lands on red tile, THEN turn right, automatically adapting to pathways.',
    highlights: ['Adapt paths without writing redundant steps', 'Learn conditional constraints (IF tile color)', 'Enhance grid adaptability'],
    suggestedActivity: 'Build a code block with conditional tiles to bypass hot lava.',
    activityType: 'grid'
  },
  {
    id: '2-T2-W9',
    grade: '2',
    term: 2,
    week: 9,
    strand: 'Robotics',
    title: 'Spoon Catapult Engineering',
    capsCode: ['R.5'],
    description: 'Learn elastic potential energy and mechanical designs with popsicle sticks, rubber bands, and spoons.',
    highlights: ['Build levers and fulcrum points', 'Measure launch ranges and angles', 'Calculate force tension differences'],
    suggestedActivity: 'Assemble popsicle components virtually and test launching mechanics.',
    activityType: 'robotics'
  },
  // TERM 3
  {
    id: '2-T3-W2',
    grade: '2',
    term: 3,
    week: 2,
    strand: 'Digital',
    title: 'Technology vs Information Technology',
    capsCode: ['D.1'],
    description: 'Differentiate between general technology (wheel, scissors, spoons) and IT (transmitting, processing, storing data).',
    highlights: ['General Tech: Tools solving physical constraints', 'IT: Electronic devices manipulating facts and numbers', 'Spot the digital boundary'],
    suggestedActivity: 'Sort scissors, laptops, bikes, and databases into IT or General Tech.',
    activityType: 'digital'
  },
  {
    id: '2-T3-W4',
    grade: '2',
    term: 3,
    week: 4,
    strand: 'Robotics',
    title: 'Color Sorting Robot & Decision Structures',
    capsCode: ['R.3', 'R.6'],
    description: 'Act as a conveyor-belt sorter. Read item colors and route them to their matched bins (IF blue -> Blue Pile).',
    highlights: ['Mimic real industrial sorting systems', 'Execute decisions based on sensor inputs', 'Build fast reflexes using IF-THEN loops'],
    suggestedActivity: 'Sort falling items in color-based hoppers quickly.',
    activityType: 'robotics'
  },
  // TERM 4
  {
    id: '2-T4-W2',
    grade: '2',
    term: 4,
    week: 2,
    strand: 'Digital',
    title: 'Digital Netiquette & Bullying Quiz',
    capsCode: ['D.2'],
    description: 'Learn online behavior guidelines. Treat peers with respect, protect digital health, and define online kindness.',
    highlights: ['Understand netiquette definitions', 'Safe practices: Don\'t share passwords or address online', 'How to stand up for cyberbullied peers'],
    suggestedActivity: 'Play Digital Safety Quiz and earn Citizenship badge.',
    activityType: 'digital'
  },
  {
    id: '2-T4-W8',
    grade: '2',
    term: 4,
    week: 8,
    strand: 'Coding',
    title: 'Combos: Decisions + Loops on Grid',
    capsCode: ['C.2', 'C.3', 'C.4'],
    description: 'Build complete algorithms combining explicit turns, repeat loops, and conditional tile responses.',
    highlights: ['Multi-condition navigation arrays', 'Shorten paths by grouping forwards into a loop', 'Debug loops that crash into trees'],
    suggestedActivity: 'Help SSB collect carrots sequentially with standard and conditional blocks.',
    activityType: 'grid'
  },

  // --- GRADE 3 ---
  // TERM 1
  {
    id: '3-T1-W1',
    grade: '3',
    term: 1,
    week: 1,
    strand: 'Coding',
    title: 'Predicting Growing & Shapes Patterns',
    capsCode: ['C.6', 'C.7'],
    description: 'Analyze complex geometric growing patterns and determine dimensions of complex figures.',
    highlights: ['Find mathematical pattern formulas', 'Calculate steps for sequence growth', 'Analyze animal footprint logs'],
    suggestedActivity: 'Calculate how many triangles and beads are needed for grid completion.',
    activityType: 'pattern'
  },
  {
    id: '3-T1-W5',
    grade: '3',
    term: 1,
    week: 5,
    strand: 'Coding',
    title: 'Pen-Based Drawing Code (Scratch-Style)',
    capsCode: ['C.2', 'C.3'],
    description: 'Write drawing algorithm code! Introduces Pen Down (start drawing) and Pen Up (hover to next coordinate).',
    highlights: ['Pen Down paints line onto cell paths', 'Pen Up stops writing', 'Symmetry drawings, mirror grids, and shapes'],
    suggestedActivity: 'Program Sipho Super Bunny to draw a perfect square on the 5x5 board.',
    activityType: 'grid'
  },
  // TERM 2
  {
    id: '3-T2-W2',
    grade: '3',
    term: 2,
    week: 2,
    strand: 'Digital',
    title: 'Digital Footprint & Positive Footprint',
    capsCode: ['D.2'],
    description: 'Discover that every click, site visited, and chat leaves an permanent record: A Digital Footprint.',
    highlights: ['What you share stays online indefinitely', 'Build a Positive Footprint with achievements and kind words', 'How to report unsafe content to parents'],
    suggestedActivity: 'Fill up a virtual footprint outline with positive safe habits.',
    activityType: 'digital'
  },
  {
    id: '3-T2-W5',
    grade: '3',
    term: 2,
    week: 5,
    strand: 'Coding',
    title: 'Two Decision Tiles Grid Challenge',
    capsCode: ['C.2', 'C.3'],
    description: 'Solve coordinates containing both Orange and Purple carrot conditions. Add multiple IF statements.',
    highlights: ['Branching outcomes based on red and blue conditions', 'Compare efficiency of different route directions', 'Avoid dangerous purple roots'],
    suggestedActivity: 'Solve 6x6 grid with complex turning and conditional tiles.',
    activityType: 'grid'
  },
  // TERM 3
  {
    id: '3-T3-W2',
    grade: '3',
    term: 3,
    week: 2,
    strand: 'Digital',
    title: 'The Adaptation & Impact of Technology',
    capsCode: ['D.6'],
    description: 'Analyze how technology changes our lives. Compare communication before and after instant messengers.',
    highlights: ['Impact on healthcare, classrooms, and work', 'Understand remote working capabilities', 'Describe differences in physical vs computer libraries'],
    suggestedActivity: 'Analyze technology transition comparisons across centuries.',
    activityType: 'digital'
  },
  {
    id: '3-T3-W4',
    grade: '3',
    term: 3,
    week: 4,
    strand: 'Robotics',
    title: 'Marble Maze Engineering & Tilts',
    capsCode: ['R.3', 'R.6', 'R.7'],
    description: 'Design a marble maze from straws inside a box. Program direction commands (Tilt Right, Tilt Up, Tilt Left) to move marble start-to-finish.',
    highlights: ['Physics balance mechanics', 'Design layout, start blocks, and exit gates', 'Translate physical tilting into programmatic instructions'],
    suggestedActivity: 'Build layout with virtual straws and tilt commands to guide the ball.',
    activityType: 'robotics'
  },
  {
    id: '3-T3-W6',
    grade: '3',
    term: 3,
    week: 6,
    strand: 'Coding',
    title: 'Efficiency & Loop Factoring',
    capsCode: ['C.2', 'C.4', 'C.5'],
    description: 'Evaluate two programs. Simplify an 8-step linear program into a highly efficient 2-step loop program.',
    highlights: ['Identify repeating blocks of code', 'Factorize instructions into repeat brackets', 'Improve sequence speed'],
    suggestedActivity: 'Combine repetitive single commands into loop segments.',
    activityType: 'grid'
  },
  // TERM 4
  {
    id: '3-T4-W2',
    grade: '3',
    term: 4,
    week: 2,
    strand: 'Digital',
    title: 'Secret Binary Beading Code (ASCII)',
    capsCode: ['D.7', 'D.8', 'D.9'],
    description: 'Learn binary ASCII representation! Map each character to an 8-bit array of 0s and 1s (e.g. A = 01000001).',
    highlights: ['Understand how computers store letters as numbers', 'Create secret binary beaded bracelets using colors', 'Encode and decode English names into binary beading'],
    suggestedActivity: 'Spell your name using binary 8-bit rows and generate a beaded necklace.',
    activityType: 'digital'
  },
  {
    id: '3-T4-W5',
    grade: '3',
    term: 4,
    week: 5,
    strand: 'Robotics',
    title: 'Robot Hand String Mechanics',
    capsCode: ['R.3', 'R.5', 'R.7'],
    description: 'Plan robotic attachments (joints, pull strings, and lever systems) to mimic biological operations first-hand.',
    highlights: ['How motors mimic physical muscles and ligaments', 'Connect triggers with motion controls', 'Formulate instruction sets for arm gestures'],
    suggestedActivity: 'Toggle string pulley systems to execute complex fingers gestures.',
    activityType: 'robotics'
  }
];

export const GRADES = [
  { value: 'R', label: 'Grade R', description: 'Early play-based, oral, unplugged foundations', color: 'border-rose-400 text-rose-500 bg-rose-50' },
  { value: '1', label: 'Grade 1', description: 'Simple symbols, loops, and hardware basics', color: 'border-sky-400 text-sky-500 bg-sky-50' },
  { value: '2', label: 'Grade 2', description: 'Explicit turns, IF-THEN conditions, sorting', color: 'border-emerald-400 text-emerald-500 bg-emerald-50' },
  { value: '3', label: 'Grade 3', description: 'Repetitive loops, ASCII binary beading, drawing', color: 'border-violet-400 text-violet-500 bg-violet-50' }
];
