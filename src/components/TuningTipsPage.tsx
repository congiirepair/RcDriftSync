import { AlertTriangle, Gauge, RotateCcw, SlidersHorizontal, Sparkles, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { AppCard, PageHeader } from "./UiPrimitives";

type TipCategory = {
  id: string;
  title: string;
  short: string;
  icon: typeof Wrench;
  goals: string[];
  tips: {
    title: string;
    plain: string;
    tryThis: string[];
    watchFor: string;
  }[];
};

const tuningCategories: TipCategory[] = [
  {
    id: "front-alignment",
    title: "Front Alignment",
    short: "Camber, caster, KPI, trail, scrub, Ackerman, and bump steer.",
    icon: SlidersHorizontal,
    goals: ["Predictable steering at angle", "Front tires that keep rolling", "Enough response without twitch"],
    tips: [
      {
        title: "Think about the tire at angle, not only at neutral",
        plain:
          "A RWD drift car can look correct sitting still and still feel wrong at full countersteer. Camber, caster, and KPI work together as the wheel turns, so the leading tire may move from negative camber toward zero or positive camber while the trailing tire does something different.",
        tryThis: [
          "Check the front tires visually at full lock in both directions.",
          "If the car pushes wide, look for too little useful front contact patch at angle.",
          "If the car darts or grabs, reduce how aggressive the front contact patch becomes at lock."
        ],
        watchFor: "Big changes to caster or KPI can also change camber gain, so make one adjustment at a time."
      },
      {
        title: "Use trail as a steering feel tool",
        plain:
          "Trail changes where the axle sits compared with the steering pivot. More positive trail usually calms the steering and adds stability. Less or negative trail usually makes the car react quicker.",
        tryThis: [
          "For a twitchy front end, try a more stable trail setting if your knuckles allow it.",
          "For a lazy car that will not catch angle quickly, try a more responsive trail setting.",
          "Record the knuckle plate, spacer, and axle setting together so you can repeat it."
        ],
        watchFor: "Trail changes can feel similar to caster changes, but caster also changes camber behavior."
      },
      {
        title: "Keep the front wheels free",
        plain:
          "If a front wheel touches the body, arm, tie rod, or a sticky bearing slows it down, the car can spin like the front brake was tapped. RWD cars need the front tires rolling cleanly through steering lock.",
        tryThis: [
          "Check tire-to-body clearance at full lock and full compression.",
          "Spin each front wheel by hand and clean or replace rough bearings.",
          "Check that tie rods and knuckle stops do not bind at maximum steering."
        ],
        watchFor: "More steering angle is not useful if the wheel stops rolling at that angle."
      },
      {
        title: "Bump steer changes the tune while the car rolls",
        plain:
          "Bump steer happens when suspension movement changes toe. A car may enter fine but become inconsistent when the front compresses. Matching link angles and avoiding extreme steering link geometry helps keep the front consistent.",
        tryThis: [
          "Compress the front suspension by hand and watch whether toe changes.",
          "Use tie rod height spacers to reduce unwanted toe change.",
          "Avoid solving every steering issue with gyro gain if the geometry is moving around."
        ],
        watchFor: "A tiny amount may be acceptable, but large toe change makes the car hard to trust."
      }
    ]
  },
  {
    id: "rear-grip",
    title: "Rear Grip and Slip",
    short: "Rear toe, squat, camber, diff, ride height, and contact patch.",
    icon: RotateCcw,
    goals: ["Forward bite when needed", "Controlled slip on high grip", "Stable transitions"],
    tips: [
      {
        title: "Build for the surface",
        plain:
          "On low grip, the rear needs help staying planted. On high grip, the rear may need help releasing. A setup that feels amazing on polished concrete may feel stuck on carpet or nervous on dusty P-tile.",
        tryThis: [
          "For low grip, try more rear stability before adding power.",
          "For high grip, try reducing rear bite before making the ESC aggressive.",
          "Save surface and tire with every tune so the setup makes sense later."
        ],
        watchFor: "Changing tires can be a bigger change than changing several suspension parts."
      },
      {
        title: "Rear toe is stability and braking at angle",
        plain:
          "More rear toe-in generally makes the car calmer and can help it drive forward at angle, but it can also slow transitions and scrub speed. Less rear toe can free the car up, but too little may make it nervous.",
        tryThis: [
          "If the car spins out or snaps in transition, try a little more rear toe-in.",
          "If the car feels stuck or slow to rotate, try reducing rear toe-in.",
          "Log toe block and shim setup, not just the final toe number."
        ],
        watchFor: "Toe block changes often affect wheelbase, roll center, and squat feel too."
      },
      {
        title: "Squat and anti-squat tune how the rear loads",
        plain:
          "Shims under RF/RR suspension mounts change how the rear arm sits and how the car loads the tire under throttle. More anti-squat can help the car release or dig differently depending on layout, grip, and throttle style.",
        tryThis: [
          "If the rear is too planted on high grip, try reducing squat or adding anti-squat carefully.",
          "If the car lacks forward drive, try a rear arm angle that helps load the tire.",
          "Record RF and RR shim thickness separately."
        ],
        watchFor: "Squat changes can also affect braking and transition timing."
      },
      {
        title: "Diff choice changes how the car breaks traction",
        plain:
          "A spool or locked rear axle tends to break both tires loose together. A gear or ball diff can make the rear feel more progressive and may help drive out of angle. There is no universal best option.",
        tryThis: [
          "Use a spool or tighter diff if you want a sharper, more direct rear.",
          "Use a smoother diff action if the car needs more corner-exit drive.",
          "Pair diff notes with ESC throttle feel, because they work together."
        ],
        watchFor: "A diff change can make your old ESC tune feel too soft or too aggressive."
      }
    ]
  },
  {
    id: "suspension",
    title: "Suspension Balance",
    short: "Springs, oil, pistons, ride height, preload, and weight transfer.",
    icon: Wrench,
    goals: ["Consistent roll", "Predictable weight transfer", "Grip without delay"],
    tips: [
      {
        title: "Springs and oil are timing tools",
        plain:
          "Springs decide how much the car wants to move. Oil and pistons decide how fast it moves. A car can have enough grip but feel late if the dampers move too slowly, or feel nervous if they move too quickly.",
        tryThis: [
          "If transitions feel lazy, test a faster moving front or rear setup.",
          "If the car snaps, test more damping or a calmer spring balance.",
          "Change front and rear separately so you know which end caused the feel."
        ],
        watchFor: "Preload changes ride height and spring force at the same time, so measure after changes."
      },
      {
        title: "Ride height changes weight transfer",
        plain:
          "A lower rear can help keep weight focused toward the rear and calm the car. Raising the rear can make the car freer and more willing to rotate. Front height changes steering feel and how fast weight moves forward.",
        tryThis: [
          "If the car lacks rear grip, test a slightly lower rear ride height.",
          "If it has too much rear grip, test a slightly higher rear or less rear compression grip.",
          "Use small changes and record millimeters."
        ],
        watchFor: "Changing ride height can also change droop and arm angle."
      },
      {
        title: "Shock tower and lower mount holes change leverage",
        plain:
          "Moving shock positions changes how strongly the damper controls the arm. More laid down often feels softer and more progressive. More upright often feels more direct.",
        tryThis: [
          "For more support and quicker response, test a more upright shock position.",
          "For smoother roll and more grip feel, test a more laid-down position.",
          "Save upper and lower shock holes separately."
        ],
        watchFor: "The same hole change can feel different with different oil or pistons."
      }
    ]
  },
  {
    id: "electronics",
    title: "Electronics Feel",
    short: "Gyro gain, servo feel, throttle curve, boost, turbo, and gearing.",
    icon: Gauge,
    goals: ["Smooth throttle", "Stable steering", "Power matched to grip"],
    tips: [
      {
        title: "Gyro gain should support the tune, not hide it",
        plain:
          "Higher gyro gain can help the car hold angle, but too much can cause steering shake or a wave-like correction. More front grip and clean steering geometry usually let you run less gain.",
        tryThis: [
          "Raise gain until steering starts to shake, then back it down.",
          "If gain has to be very high, inspect front grip, binding, and servo setup.",
          "Save gain with surface and tire because the right number changes."
        ],
        watchFor: "Gyro wobble can come from gain, servo settings, steering friction, or front tire grip."
      },
      {
        title: "Throttle should match rear grip",
        plain:
          "RWD drift is about feeding power into the grip you have. If power arrives faster than the tire can use it, the car spins or stalls in wheelspin. If power is too soft, the car cannot hold angle or drive forward.",
        tryThis: [
          "For low grip, smooth the throttle curve or reduce punch.",
          "For high grip, add enough punch, boost, or turbo to break traction when needed.",
          "Use gearing so the motor still has reserve power at drift speed."
        ],
        watchFor: "More boost or turbo can add heat, so monitor motor and ESC temperature."
      },
      {
        title: "Servo speed and dead band affect front stability",
        plain:
          "A very fast servo can feel sharp, but it can also make a nervous car harder to drive. Dead band, damper, and smoother settings can reduce hunting and front wheel shake.",
        tryThis: [
          "If the car is twitchy, calm the servo tune before changing everything else.",
          "If transitions feel late, test a quicker servo feel.",
          "Save servo profile snapshots so old tunes do not silently change."
        ],
        watchFor: "Servo settings interact with gyro gain, so retest gain after servo changes."
      }
    ]
  },
  {
    id: "track-process",
    title: "Trackside Process",
    short: "How to test changes without getting lost.",
    icon: Sparkles,
    goals: ["One change at a time", "Clear before/after notes", "Repeatable baselines"],
    tips: [
      {
        title: "Start from a baseline",
        plain:
          "A baseline is not supposed to be perfect. It is a known setup you can return to. Without a baseline, every change becomes a guess.",
        tryThis: [
          "Save the setup before changing parts.",
          "Duplicate the tune before testing a new direction.",
          "Write what you expected to happen before driving."
        ],
        watchFor: "If you change parts, tires, and electronics at once, you will not know what fixed or broke the car."
      },
      {
        title: "Describe feel in driver language",
        plain:
          "Numbers matter, but feel is what you drive. Record whether the car gained forward bite, rotation, angle, stability, transition speed, or smoothness.",
        tryThis: [
          "After each pack, rate the car before editing again.",
          "Use quick tags like stable, twitchy, needs rear grip, or too much push.",
          "Compare the new tune against the previous version."
        ],
        watchFor: "A change can improve solo laps but make tandem harder, so note the use case."
      }
    ]
  },
  {
    id: "symptoms",
    title: "Quick Symptom Guide",
    short: "Fast places to look when the car feels wrong.",
    icon: AlertTriangle,
    goals: ["Find likely causes", "Avoid random changes", "Get back on track faster"],
    tips: [
      {
        title: "Spins out",
        plain: "The rear is losing grip faster than the car can catch angle, or the steering/gyro is overcorrecting.",
        tryThis: ["Check rear tire, rear toe, diff, throttle curve, gyro gain, and rear ride height.", "Make throttle smoother before adding more rear grip everywhere."],
        watchFor: "If it only happens in transitions, check servo/gyro speed and rear toe."
      },
      {
        title: "Pushes wide",
        plain: "The front is not creating enough useful direction, or the rear is driving through the front.",
        tryThis: ["Check front tire contact patch at lock, front camber/caster/KPI, Ackerman, front wheel clearance, and gyro gain.", "Try more front grip or less rear drive depending on surface."],
        watchFor: "Adding rear grip can make push worse."
      },
      {
        title: "Gyro wobble",
        plain: "The steering system is correcting too aggressively or fighting friction/geometry.",
        tryThis: ["Lower gyro gain, calm servo settings, inspect binding, check front tire grip, and verify endpoints.", "Retest after each change."],
        watchFor: "A loose servo saver or rough steering can look like a gyro problem."
      },
      {
        title: "Not enough forward drive",
        plain: "The rear tires are spinning without pushing the car forward, or the electronics are too soft once the car is at angle.",
        tryThis: ["Check rear tire, diff action, rear toe, squat, ESC throttle curve, boost/turbo, and weight balance.", "Try smoother initial throttle with stronger mid/high throttle if needed."],
        watchFor: "More power alone can make the car slower if the tire cannot use it."
      }
    ]
  }
];

export function TuningTipsPage() {
  const [activeId, setActiveId] = useState(tuningCategories[0].id);
  const activeCategory = useMemo(() => tuningCategories.find((category) => category.id === activeId) ?? tuningCategories[0], [activeId]);
  const ActiveIcon = activeCategory.icon;

  return (
    <main className="appPage tuningTipsPage">
      <PageHeader eyebrow="Trackside guide" title="Tuning Tips">
        <button className="smallPill" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</button>
      </PageHeader>

      <section className="tipsHero">
        <div>
          <span>RC Drift Sync tuning guide</span>
          <h2>Make one smart change at a time.</h2>
          <p>
            These notes translate common RWD RC drift setup ideas into plain language for trackside use. Use them as starting points, then save what actually worked for your car, tire, surface, and driving style.
          </p>
        </div>
      </section>

      <section className="tipsCategoryScroller" aria-label="Tuning tip categories">
        {tuningCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button key={category.id} className={category.id === activeId ? "active" : ""} type="button" onClick={() => setActiveId(category.id)}>
              <Icon size={18} />
              <span>{category.title}</span>
            </button>
          );
        })}
      </section>

      <section className="tipsFocusCard">
        <header>
          <ActiveIcon size={26} />
          <div>
            <h2>{activeCategory.title}</h2>
            <p>{activeCategory.short}</p>
          </div>
        </header>
        <div className="tipsGoalGrid">
          {activeCategory.goals.map((goal) => <span key={goal}>{goal}</span>)}
        </div>
      </section>

      <section className="tipsGrid">
        {activeCategory.tips.map((tip) => (
          <AppCard key={tip.title} className="tipCard">
            <strong>{tip.title}</strong>
            <p>{tip.plain}</p>
            <div>
              <span>Try this</span>
              <ul>
                {tip.tryThis.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <em>{tip.watchFor}</em>
          </AppCard>
        ))}
      </section>

      <section className="tipsReferenceNote">
        <strong>How to use this guide</strong>
        <p>
          Treat each suggestion as a test, not a rule. Save your baseline, change one area, drive a pack, then record whether the car became better, worse, or just different.
        </p>
      </section>
    </main>
  );
}
