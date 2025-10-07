import React, { useEffect, useState, useRef } from 'react';
import logo from "@/assets/logos/B1.png";
/*
  telc-exams-components.jsx
  Single-file collection of React components (Next.js + Tailwind-ready) that implement:
  - Exams gallery (image + level + title)
  - Exam detail page with description and "Start Exam" button
  - Stage runner and per-stage components for all telc stages described by user
  - Timer, audio controls (placeholders), responsive layout
  - LocalStorage-based persistence (answers + progress)

  Also contains:
  - Fake seed data for exams
  - Suggested DB schemas for MongoDB (NoSQL) and PostgreSQL (SQL)
  - Example API route shapes (to be turned into real Next.js API routes)

  How to use:
  - Drop this file into a components/ or lib/ folder and import the exported components
  - The main exported component below is `TelcExamApp` which demonstrates usage

  Notes & limitations:
  - Audio is mocked using placeholder URLs. Replace with real audio files for listening stages.
  - The components are intentionally simple and focussed on state, styling, and flow.
*/

/* ----------------------------- FAKE DATA --------------------------------- */
export const TELC_B1_EXAM = [{
  id: 'telc-b1-1',
  title: 'telc deutsch b1 - practice set 1',
  level: 'B1',
  cover: logo.src,
  description:
    'Full B1 exam simulation: Leseverstehen, Sprachbausteine, Hörverstehen, Schriftlicher Ausdruck. Timed sections and stage-by-stage navigation.',
  stages: [
    { id: 'lv1', title: 'Leseverstehen — Teil 1', type: 'zuordnung-smalltexts', durationMin: 10 },
    { id: 'lv2', title: 'Leseverstehen — Teil 2', type: 'multiple-choice-continue', durationMin: 12 },
    { id: 'lv3', title: 'Leseverstehen — Teil 3', type: 'zuordnung-posters', durationMin: 8 },
    { id: 'sb1', title: 'Sprachbausteine — Teil 1', type: 'grammar-mc', durationMin: 10 },
    { id: 'sb2', title: 'Sprachbausteine — Teil 2', type: 'lexik-mc', durationMin: 12 },
    { id: 'hv1', title: 'Hörverstehen — Teil 1', type: 'listening-30s-oneread', durationMin: 8 },
    { id: 'hv2', title: 'Hörverstehen — Teil 2', type: 'listening-1min-twice', durationMin: 10 },
    { id: 'hv3', title: 'Hörverstehen — Teil 3', type: 'listening-30s-twice', durationMin: 6 },
    { id: 'schrift', title: 'Schriftlicher Ausdruck', type: 'writing-email', durationMin: 30 },
  ],
  payloads: {
    'zuordnung-smalltexts': {
      texts: [
        { id: 'A', text: 'Kleiner Text A — Angebot' },
        { id: 'B', text: 'Kleiner Text B — Info' },
        { id: 'C', text: 'Kleiner Text C — Einladung' },
        { id: 'D', text: 'Kleiner Text D — Notiz' },
        { id: 'E', text: 'Kleiner Text E — Ankündigung' },
      ],
      sentences: Array.from({ length: 10 }).map((_, i) => ({ id: `s${i + 1}`, text: `Satz ${i + 1}` })),
    },

    'multiple-choice-continue': {
      passage:
        'Lisa lebt seit drei Jahren in Berlin. Sie arbeitet als Lehrerin an einer Grundschule und fährt jeden Morgen mit dem Fahrrad zur Arbeit. Nachmittags trifft sie oft ihre Freunde im Park oder geht ins Kino. Am Wochenende reist sie gern in andere Städte oder besucht ihre Familie auf dem Land.',
      items: [
        {
          id: 'mc1',
          prompt: 'Lisa arbeitet als...',
          options: [
            'Krankenschwester in einem Krankenhaus',
            'Lehrerin an einer Grundschule',
            'Verkäuferin in einem Supermarkt',
          ],
          correct: 1,
        },
        {
          id: 'mc2',
          prompt: 'Wie fährt Lisa normalerweise zur Arbeit?',
          options: ['Mit dem Auto', 'Mit dem Bus', 'Mit dem Fahrrad'],
          correct: 2,
        },
        {
          id: 'mc3',
          prompt: 'Was macht Lisa oft am Nachmittag?',
          options: [
            'Sie schläft zu Hause.',
            'Sie trifft Freunde im Park.',
            'Sie arbeitet bis spät am Abend.',
          ],
          correct: 1,
        },
        {
          id: 'mc4',
          prompt: 'Was macht Lisa am Wochenende gern?',
          options: [
            'Sie reist in andere Städte.',
            'Sie arbeitet an neuen Projekten.',
            'Sie macht immer Hausaufgaben.',
          ],
          correct: 0,
        },
        {
          id: 'mc5',
          prompt: 'Wo lebt Lisas Familie?',
          options: ['In der Stadt Berlin', 'Auf dem Land', 'In einem anderen Land'],
          correct: 1,
        },
      ],
    },

    'zuordnung-posters': {
      texts: [
        { id: 'P1', text: 'Poster 1 — Musikfestival am Wochenende' },
        { id: 'P2', text: 'Poster 2 — Neues Café eröffnet in der Stadt' },
        { id: 'P3', text: 'Poster 3 — Flohmarkt am Sonntag' },
      ],
      sentences: Array.from({ length: 6 }).map((_, i) => ({ id: `ps${i + 1}`, text: `Satz ${i + 1}` })),
    },

    'grammar-mc': {
      blanks: [
        { id: 'b1', before: 'Ich ', after: ' ins Kino.', options: ['gehe', 'geht', 'gehst'], correct: 'gehe' },
        { id: 'b2', before: 'Wir ', after: ' Fußball.', options: ['spiele', 'spielen', 'spielt'], correct: 'spielen' },
        { id: 'b3', before: 'Er ', after: ' sehr müde.', options: ['bin', 'ist', 'sind'], correct: 'ist' },
      ],
    },

    'lexik-mc': {
      blanks: [
        { id: 'l1', before: 'Ich gehe gern ', after: ', weil ich neue Orte sehen möchte.', options: ['Reisen', 'Arbeiten', 'Einkaufen', 'Lernen', 'Spielen'], correct: 'Reisen' },
        { id: 'l2', before: 'Meine Mutter ist ', after: ' und arbeitet im Krankenhaus.', options: ['Lehrerin', 'Ärztin', 'Ingenieurin', 'Köchin', 'Verkäuferin'], correct: 'Ärztin' },
        { id: 'l3', before: 'Ich fahre jeden Tag mit dem ', after: ' zur Arbeit.', options: ['Zug', 'Auto', 'Fahrrad', 'Bus', 'Flugzeug'], correct: 'Bus' },
        { id: 'l4', before: 'Am ', after: ' trinke ich gern Kaffee.', options: ['Morgen', 'Abend', 'Mittag', 'Nacht', 'Frühstück'], correct: 'Morgen' },
        { id: 'l5', before: 'Ich wohne in einer kleinen ', after: ' mit Balkon.', options: ['Haus', 'Wohnung', 'Garten', 'Zimmer', 'Balkon'], correct: 'Wohnung' },
        { id: 'l6', before: 'Am Wochenende sehe ich einen guten ', after: '.', options: ['Buch', 'Film', 'Musik', 'Kunst', 'Sport'], correct: 'Film' },
        { id: 'l7', before: 'Zum Frühstück esse ich oft ', after: ' und trinke Kaffee.', options: ['Apfel', 'Brot', 'Käse', 'Milch', 'Wasser'], correct: 'Brot' },
        { id: 'l8', before: 'Im Urlaub fahre ich gern aufs ', after: ', um Ruhe zu haben.', options: ['Stadt', 'Land', 'Berg', 'Meer', 'Wald'], correct: 'Land' },
        { id: 'l9', before: 'Mein Lieblingshaustier ist der ', after: ', er ist sehr freundlich.', options: ['Hund', 'Katze', 'Vogel', 'Fisch', 'Pferd'], correct: 'Hund' },
        { id: 'l10', before: 'Im ', after: ' gehe ich oft schwimmen.', options: ['Winter', 'Sommer', 'Herbst', 'Frühling', 'Regen'], correct: 'Sommer' },
      ],
    },

    'listening-30s-oneread': {
      audioUrl: '/audio/sample1.mp3',
      instructions: 'Höre den Text einmal. Danach siehst du 10 Aussagen. Entscheide, ob sie richtig oder falsch sind.',
      prompts: [
        { id: 'hp1', text: 'Lisa steht jeden Morgen um sechs Uhr auf.' },
        { id: 'hp2', text: 'Sie fährt mit dem Auto zur Arbeit.' },
        { id: 'hp3', text: 'In ihrer Freizeit liest sie gern Bücher.' },
        { id: 'hp4', text: 'Am Wochenende besucht sie oft ihre Freunde.' },
        { id: 'hp5', text: 'Sie arbeitet in einem Krankenhaus.' },
        { id: 'hp6', text: 'Ihr Lieblingsessen ist Pizza.' },
        { id: 'hp7', text: 'Lisa wohnt in einer kleinen Wohnung in Berlin.' },
        { id: 'hp8', text: 'Sie hört jeden Tag Musik beim Kochen.' },
        { id: 'hp9', text: 'Im Sommer fährt sie gern ans Meer.' },
        { id: 'hp10', text: 'Sie hat einen Hund, der Max heißt.' },
      ],
      correctAnswers: [true, false, true, true, false, true, true, true, true, false],
      transcript: `Hallo! Mein Name ist Lisa und ich möchte euch ein bisschen über meinen Alltag erzählen. 
Ich stehe jeden Morgen um sechs Uhr auf und frühstücke mit einer Tasse Kaffee und einem Stück Brot. 
Danach fahre ich mit dem Fahrrad zur Arbeit, weil ich in der Nähe wohne. 
Ich arbeite in einem Büro, nicht im Krankenhaus. 
In meiner Freizeit lese ich gern Bücher oder treffe Freunde. 
Am Wochenende besuche ich oft meine Freunde oder gehe spazieren. 
Mein Lieblingsessen ist Pizza, aber ich koche auch gern selbst. 
Ich wohne in einer kleinen Wohnung in Berlin und höre jeden Tag Musik beim Kochen. 
Im Sommer fahre ich gern ans Meer, weil ich das Wasser liebe. 
Tiere mag ich sehr, aber ich habe leider keinen Hund.`,
    },

    'listening-1min-twice': {
      audioUrl: '/audio/sample2.mp3',
      instructions: 'Du hörst eine Durchsage zweimal. Lies die Aussagen und entscheide, ob sie richtig oder falsch sind.',
      prompts: [
        { id: 'hp2_1', text: 'Der Zug nach München fährt heute von Gleis 5 ab.' },
        { id: 'hp2_2', text: 'Die Abfahrt ist um 18:30 Uhr.' },
        { id: 'hp2_3', text: 'Der Zug hält unterwegs auch in Augsburg.' },
        { id: 'hp2_4', text: 'Wegen technischer Probleme kommt es zu Verspätungen.' },
        { id: 'hp2_5', text: 'Fahrgäste mit Reservierung sollen zum Informationsschalter kommen.' },
        { id: 'hp2_6', text: 'Im Zug gibt es ein Bordrestaurant.' },
        { id: 'hp2_7', text: 'Kinder unter sechs Jahren reisen kostenlos mit.' },
        { id: 'hp2_8', text: 'Die nächste Verbindung nach München ist in zwei Stunden.' },
        { id: 'hp2_9', text: 'Alle Fahrgäste müssen Masken tragen.' },
        { id: 'hp2_10', text: 'Die Fahrgäste sollen ihre Tickets beim Einstieg bereithalten.' },
      ],
      correctAnswers: [true, false, true, true, false, true, true, false, false, true],
      transcript: `Achtung, eine Durchsage. 
Der Zug nach München fährt heute von Gleis 5 ab. 
Die Abfahrt ist um 18 Uhr. 
Der Zug hält unterwegs auch in Augsburg. 
Wegen technischer Probleme kommt es zu einer Verspätung von etwa zehn Minuten. 
Fahrgäste mit Reservierung müssen nichts unternehmen. 
Im Zug befindet sich ein Bordrestaurant. 
Kinder unter sechs Jahren reisen kostenlos mit. 
Die nächste Verbindung nach München fährt um 20 Uhr. 
Bitte halten Sie Ihre Tickets beim Einstieg bereit. Vielen Dank.`,
    },

    'listening-30s-twice': {
      audioUrl: 'https://cdn.jsdelivr.net/gh/florincs/german-audio/telc-b1-1-03.mp3',
      instructions: 'Du hörst den Text zweimal. Danach siehst du fünf Aussagen. Entscheide, ob sie richtig oder falsch sind.',
      prompts: [
        { id: 'hp3_1', text: 'Tom arbeitet in einem Café.' },
        { id: 'hp3_2', text: 'Er steht jeden Tag um fünf Uhr auf.' },
        { id: 'hp3_3', text: 'Am Nachmittag spielt er gern Gitarre.' },
        { id: 'hp3_4', text: 'Er trinkt keinen Kaffee.' },
        { id: 'hp3_5', text: 'Am Sonntag besucht er seine Familie.' },
      ],
      correctAnswers: [false, true, true, false, true],
      transcript: `Hallo, ich bin Tom. Ich arbeite nicht in einem Café, sondern in einer kleinen Bäckerei im Zentrum. 
Mein Tag beginnt sehr früh – meistens schon um fünf Uhr morgens. 
Ich backe Brot, Brötchen und manchmal Kuchen. 
Am Nachmittag habe ich frei. Dann höre ich Musik oder spiele Gitarre mit meinen Freunden. 
Ich liebe Kaffee und trinke oft eine Tasse in meiner Pause. 
Am Sonntag habe ich immer frei und besuche meine Familie. Das ist für mich sehr wichtig.`,
    },

    'writing-email': {
      prompt: `Betreff: Einladung zum Sommerfest 🌞  
Von: Anna.Meyer@example.com  
An: [Ihre E-Mail-Adresse]

Liebe/r [Name],

nächste Woche am Samstag feiern wir in unserem Deutschkurs ein kleines Sommerfest im Park. 
Jede Person soll etwas zu essen oder zu trinken mitbringen. 
Bitte schreiben Sie mir eine kurze E-Mail und sagen Sie mir:

- ob Sie kommen können,  
- was Sie mitbringen,  
- und ob Sie beim Aufbau helfen können.

Ich freue mich auf Ihre Antwort!

Viele Grüße  
Anna Meyer`,
    },
  },
}
];

/* ----------------------------- HELPERS ---------------------------------- */
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storage error', e);
  }
};
const loadFromStorage = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};

/* ----------------------------- STYLES ----------------------------------- */
// Tailwind utility classes are used inline in JSX. No CSS file required.

/* --------------------------- Timer Component ----------------------------- */
function Timer({ minutes, running, onTick, onFinish }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  useEffect(() => {
    setSecondsLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        onTick && onTick(next);
        if (next <= 0) {
          clearInterval(id);
          onFinish && onFinish();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const ss = (secondsLeft % 60).toString().padStart(2, '0');
  return (
    <div className="inline-flex items-center gap-2 bg-white/5 p-2 rounded-lg">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-mono text-lg">{mm}:{ss}</span>
    </div>
  );
}

/* ------------------------- Stage Components ------------------------------ */

function LeseZuordnungSmallTexts({ stageId, questions, onAnswer, answers }) {
  // 10 sentences, 5 small texts to match
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Zuordnungsaufgaben — kleine Texte</h3>
      <p className="text-sm text-muted-foreground">Ziehe oder wähle das richtige kleine Textfragment zur Satznummer.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/5 p-4 rounded-md">
          <h4 className="font-medium">Kleine Texte</h4>
          <ul className="mt-2 space-y-2">
            {questions.texts.map((t) => (
              <li key={t.id} className="p-2 border rounded">{t.text}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white/5 p-4 rounded-md">
          <h4 className="font-medium">Sätze — wähle zu</h4>
          <ul className="mt-2 space-y-2">
            {questions.sentences.map((s) => (
              <li key={s.id} className="flex items-center justify-between p-2 border rounded">
                <div>{s.text}</div>
                <select
                  value={answers[s.id] ?? ''}
                  onChange={(e) => onAnswer(s.id, e.target.value)}
                  className="bg-transparent"
                >
                  <option value="">—</option>
                  {questions.texts.map((t) => (
                    <option key={t.id} value={t.id}>{`Text ${t.id}`}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MultipleChoiceContinue({ stageId, passage, items, onAnswer, answers }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Multiple Choice — Fortsetzungen</h3>
      <p className="text-sm">Lies den langen Text und wähle die passende Fortsetzung für jede Satznummer.</p>
      <div className="bg-white/5 p-4 rounded">
        <div className="prose max-w-none">{passage}</div>
      </div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="p-3 border rounded flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-2 md:mb-0">{it.prompt}</div>
            <div className="flex gap-2">
              {it.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => onAnswer(it.id, i)}
                  className={`px-3 py-1 rounded ${answers[it.id] === i ? 'bg-indigo-600 text-white' : 'bg-white/5'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrammarMC({ stageId, text, blanks, onAnswer, answers }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sprachbausteine — Grammatik</h3>
      <p className="text-sm">Ergänze das Textfeld mit der richtigen Option für jede Lücke.</p>
      <div className="bg-white/5 p-4 rounded">
        <p className="prose max-w-none">
          {blanks.map((b) => (
            <span key={b.id} className="inline-block align-middle">
              {b.before}
              <select value={answers[b.id] ?? ''} onChange={(e) => onAnswer(b.id, e.target.value)} className="mx-1">
                <option value="">—</option>
                {b.options.map((o, i) => (
                  <option key={i} value={o}>{o}</option>
                ))}
              </select>
              {b.after}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

function ListeningStage({
  stageId,
  prompts,
  audioUrl,
  readTimeSec = 30,
  repeats = 1,
  onAnswer,
  answers,
}) {
  const audioRef = useRef(null);
  const [readCountdown, setReadCountdown] = useState(readTimeSec);
  const [phase, setPhase] = useState("read"); // 'read' | 'playing' | 'done'
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [canPlay, setCanPlay] = useState(false);

  // Countdown for reading phase
  useEffect(() => {
    if (phase === "read") {
      setReadCountdown(readTimeSec);
      const id = setInterval(() => {
        setReadCountdown((s) => {
          if (s <= 1) {
            clearInterval(id);
            setPhase("playing");
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [phase, readTimeSec]);

  // Ensure audio is loaded and playable
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.oncanplaythrough = () => setCanPlay(true);
    }
  }, [audioUrl]);

  // Play audio automatically (no button)
  useEffect(() => {
    if (phase === "playing" && audioRef.current && canPlay) {
      const playAudio = () => {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch(() =>
            console.warn("Autoplay blocked — user interaction may be required")
          );
      };

      playAudio();

      audioRef.current.onended = () => {
        if (currentRepeat + 1 < repeats) {
          // Wait 2 seconds between repeats
          setTimeout(() => {
            setCurrentRepeat((r) => r + 1);
            playAudio();
          }, 2000);
        } else {
          setPhase("done");
        }
      };
    }
  }, [phase, currentRepeat, repeats, canPlay]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Hörverstehen</h3>
      <p className="text-sm">
        Du hast <strong>{readTimeSec}s</strong> zum Lesen. Danach wird das Audio
        automatisch abgespielt.
      </p>

      <div className="bg-white/5 p-4 rounded">
        <div className="mb-3">
          {phase === "read"
            ? `Lesezeit: ${readCountdown}s`
            : phase === "playing"
            ? `Wiedergabe (${currentRepeat + 1}/${repeats})...`
            : "Abgeschlossen"}
        </div>

        <audio ref={audioRef} src={audioUrl} preload="auto" />

        <ul className="space-y-2">
          {prompts.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>{p.text}</div>
              <select
                value={answers[p.id] ?? ""}
                onChange={(e) => onAnswer(p.id, e.target.value)}
              >
                <option value="">—</option>
                <option value="true">Richtig</option>
                <option value="false">Falsch</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


function WritingEmail({ prompt, onSave, draft }) {
  const [text, setText] = useState(draft || '');
  useEffect(() => setText(draft || ''), [draft]);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Schriftlicher Ausdruck — E‑Mail</h3>
      <p className="text-sm">Antworten Sie auf die gegebene E‑Mail. Nutzen Sie angemessene Grußformen und Struktur.</p>
      <div className="bg-white/5 p-4 rounded">
        <div className="prose max-w-none mb-3">{prompt}</div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="w-full p-3 rounded bg-white/5" />
        <div className="flex justify-end gap-2">
          <button onClick={() => onSave(text)} className="px-4 py-2 rounded bg-indigo-600 text-white">Save draft</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Stage Dispatcher ------------------------------ */
function StageRenderer({ stage, state, setState, onNext }) {
  const answers = state.answers || {};
  const setAnswer = (qid, val) => {
    const next = { ...answers, [qid]: val };
    setState((s) => ({ ...s, answers: next }));
  };

  
  const FAKE_PAYLOADS = {
  'zuordnung-smalltexts': TELC_B1_EXAM[0].payloads['zuordnung-smalltexts'],
  'multiple-choice-continue': TELC_B1_EXAM[0].payloads['multiple-choice-continue'],
  'zuordnung-posters': TELC_B1_EXAM[0].payloads['zuordnung-posters'],
  'grammar-mc': TELC_B1_EXAM[0].payloads['grammar-mc'],
  'lexik-mc': TELC_B1_EXAM[0].payloads['lexik-mc'],
  'listening-30s-oneread': TELC_B1_EXAM[0].payloads['listening-30s-oneread'],
  'listening-1min-twice': TELC_B1_EXAM[0].payloads['listening-1min-twice'],
  'listening-30s-twice': TELC_B1_EXAM[0].payloads['listening-30s-twice'],
  'writing-email': TELC_B1_EXAM[0].payloads['writing-email'],
};


  const payload = FAKE_PAYLOADS[stage.type];
  switch (stage.type) {
    case 'zuordnung-smalltexts':
      return (
        <LeseZuordnungSmallTexts
          stageId={stage.id}
          questions={payload}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'multiple-choice-continue':
      return (
        <MultipleChoiceContinue
          stageId={stage.id}
          passage={payload.passage}
          items={payload.items}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'zuordnung-posters':
      return (
        <LeseZuordnungSmallTexts
          stageId={stage.id}
          questions={payload}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'grammar-mc':
      return <GrammarMC stageId={stage.id} text={''} blanks={payload.blanks} onAnswer={setAnswer} answers={answers} />;
    case 'lexik-mc':
      return <GrammarMC stageId={stage.id} text={''} blanks={payload.blanks} onAnswer={setAnswer} answers={answers} />;
    case 'listening-30s-oneread':
      return (
        <ListeningStage
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={30}
          repeats={1}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'listening-1min-twice':
      return (
        <ListeningStage
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={60}
          repeats={2}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'listening-30s-twice':
      return (
        <ListeningStage
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={30}
          repeats={2}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'writing-email':
      return <WritingEmail prompt={payload.prompt} onSave={(t) => setAnswer('draft', t)} draft={answers.draft} />;
    default:
      return <div>Unbekannter Aufgabentyp</div>;
  }
}

/* ------------------------- Exam Detail / Runner ------------------------- */
export function ExamDetail({ exam, onBack }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(null);
  const [examState, setExamState] = useState(() =>
    loadFromStorage(`examState:${exam.id}`, {})
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [sectionSecondsLeft, setSectionSecondsLeft] = useState(0);

  useEffect(() => saveToStorage(`examState:${exam.id}`, examState), [examState]);

  function startStage(index) {
    setCurrentStageIndex(index);
    setTimerRunning(true);
    const minutes = exam.stages[index].durationMin || 10;
    setSectionSecondsLeft(minutes * 60);
    setExamState((s) => ({
      ...s,
      startedAt: s.startedAt || Date.now(),
      stages: {
        ...(s.stages || {}),
        [exam.stages[index].id]: { startedAt: Date.now(), answers: {} },
      },
    }));
  }

  function finishStage(index) {
  const stageId = exam.stages[index].id;
  setExamState((s) => {
    const prevStage = s.stages?.[stageId] || { answers: {} };
    return {
      ...s,
      stages: {
        ...(s.stages || {}),
        [stageId]: {
          ...prevStage,
          finishedAt: Date.now(),
        },
      },
    };
  });
  setTimerRunning(false);
}


  function handleNext() {
    console.log(exam.stages)
    if (currentStageIndex === null) return;
    finishStage(currentStageIndex);
    const next = currentStageIndex + 1;
    if (next < exam.stages.length) startStage(next);
    else setCurrentStageIndex(null);
  }

  function handleSaveAnswers(stageId, answers) {
    setExamState((s) => ({
      ...s,
      stages: {
        ...(s.stages || {}),
        [stageId]: { ...(s.stages?.[stageId] || {}), answers },
      },
    }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">{exam.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Level: {exam.level}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            ← Back
          </button>
          {currentStageIndex === null ? (
            <button
              onClick={() => startStage(0)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 transition"
            >
              Start Exam
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Timer
                minutes={Math.ceil(sectionSecondsLeft / 60)}
                running={timerRunning}
                onTick={(s) => setSectionSecondsLeft(s)}
                onFinish={() => setTimerRunning(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Exam Overview or Stage */}
      {currentStageIndex === null ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Exam Structure */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="font-semibold text-lg mb-3">Exam Structure</h3>
            <ol className="space-y-3">
              {exam.stages.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-indigo-50 transition"
                >
                  <div>
                    <div className="font-medium text-gray-800">{s.title}</div>
                    <div className="text-sm text-gray-500">Duration: {s.durationMin} min</div>
                  </div>
                  <button
                    onClick={() => startStage(i)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Start
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Exam Info */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="font-semibold text-lg mb-3">Information</h3>
            <p className="text-gray-600">{exam.description}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          {/* Stage Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {exam.stages[currentStageIndex].title}
              </div>
              <div className="text-sm text-gray-500">
                Stage {currentStageIndex + 1} of {exam.stages.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  finishStage(currentStageIndex);
                  setCurrentStageIndex(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Stop
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          </div>

          {/* Stage Content */}
          <StageRenderer
            stage={exam.stages[currentStageIndex]}
            state={examState.stages?.[exam.stages[currentStageIndex].id] || { answers: {} }}
            setState={(updater) => {
              const newState =
                typeof updater === "function"
                  ? updater(examState.stages?.[exam.stages[currentStageIndex].id] || { answers: {} })
                  : updater;
              handleSaveAnswers(exam.stages[currentStageIndex].id, newState.answers);
              setExamState((s) => ({
                ...s,
                stages: { ...(s.stages || {}), [exam.stages[currentStageIndex].id]: newState },
              }));
            }}
            onNext={handleNext}
          />
        </div>
      )}

      {/* Final Submit */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const stages = exam.stages.map((s) => ({
              id: s.id,
              answers: examState.stages?.[s.id]?.answers || {},
            }));
            const total = stages.reduce((acc, st) => acc + Object.keys(st.answers || {}).length, 0);
            alert(`Final submit — you answered ${total} items. (Implement scoring on server)`);
            console.log('Submitted exam data:', { examId: exam.id, stages });
          }}
          className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium shadow-md hover:bg-emerald-700 transition"
        >
          Submit Exam
        </button>
      </div>
    </motion.div>
  );
}


/* --------------------------- Exams List UI ------------------------------- */
import { motion } from "framer-motion";

export function ExamsGallery({ exams = TELC_B1_EXAM, onOpen }) {
  console.log(logo);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {exams.map((ex) => (
        <motion.div
          key={ex.id}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl overflow-hidden shadow-md border hover:shadow-xl transition-all duration-300 flex flex-col"
        >
          <div className="relative h-44 w-full">
            <img
              src={ex.cover}
              alt={ex.title}
              className="object-cover h-full w-full transform hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              {ex.level}
            </span>
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-bold text-lg text-gray-900 truncate">{ex.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {ex.description || "Prüfungsvorbereitung für Ihr Sprachniveau."}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onOpen(ex)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Starten
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}


/* ------------------------ Top-level demo App ----------------------------- */
export default function TelcExamApp() {
  const [exams, setExams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch("/api/getTelcExams");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("Failed to load exams:", err);
        setError("Fehler beim Laden der Prüfungen.");
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">telc Exam Center — Demo</h1>
      </header>
      {!selected ? (
        <ExamsGallery exams={TELC_B1_EXAM} onOpen={(e) => setSelected(e)} />
      ) : (
        <ExamDetail exam={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ---------------------------- DB SCHEMAS --------------------------------

  Recommended approach: Use a document DB (MongoDB) for flexible exam content, or Postgres for stricter schemas.

  MONGODB (NoSQL) sample document (exams collection):
  {
    _id: ObjectId,
    slug: 'telc-b1-1',
    title: 'telc deutsch b1 - practice set 1',
    level: 'B1',
    description: '...',
    coverUrl: '/images/..',
    stages: [
      { id: 'lv1', title: 'Leseverstehen — Teil 1', type: 'zuordnung-smalltexts', durationMin: 10, payload: { texts: [...], sentences: [...] } },
      ...
    ],
    createdAt: ISODate,
  }

  USER / ATTEMPT collection (store per-user progress & answers):
  {
    _id: ObjectId,
    userId: 'user_abc',
    examSlug: 'telc-b1-1',
    startedAt: ISODate,
    finishedAt: ISODate | null,
    stages: {
      lv1: { startedAt: ISODate, finishedAt: ISODate, answers: { s1: 'A', s2: 'C', ... } },
      sb1: { ... }
    },
    score: { byStage: { lv1: 12, sb1: 8 }, total: 80 }
  }

  POSTGRES (SQL) suggested tables (normalized):

  exams (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    level TEXT,
    description TEXT,
    cover_url TEXT,
    created_at TIMESTAMP
  );

  stages (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id),
    slug TEXT,
    title TEXT,
    type TEXT,
    duration_min INTEGER,
    payload_json JSONB
  );

  attempts (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    exam_id INTEGER REFERENCES exams(id),
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    meta_json JSONB
  );

  attempt_stage_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES attempts(id),
    stage_id INTEGER REFERENCES stages(id),
    answers_json JSONB,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
  );

  Notes: Use JSONB payloads for the flexible question content (texts, options, audio links). This keeps structure and still allows SQL querying if needed.

/* -------------------------- Example API outlines -------------------------
  GET /api/exams -> returns list of exams
  GET /api/exams/[slug] -> exam detail with stages (without answers)
  POST /api/attempts -> create new attempt (userId, examSlug) -> returns attempt id
  POST /api/attempts/[id]/stages/[stageId]/answers -> save answers for a stage
  POST /api/attempts/[id]/submit -> finalize and compute score server-side

  In Next.js place these under /pages/api/... or /app/api/...

*/
