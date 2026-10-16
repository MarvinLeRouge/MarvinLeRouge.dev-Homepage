import type { Locale } from './locales';

/** Text with inline emphasis, rendered by the RichText component. */
export type RichText = readonly (string | { readonly strong: string } | { readonly em: string })[];

interface HomeStrings {
  readonly warningTape: string;
  readonly jobTitle: string;
  readonly zone: string;
  readonly pitch: RichText;
  readonly warningLabel: string;
  readonly warningIntro: RichText;
  readonly warningEffects: RichText;
  readonly warningOutro: string;
  readonly githubLink: string;
  readonly footerSite: string;
  readonly footerHarm: string;
  readonly footerDeadCodeBefore: string;
  readonly footerDeadCodeStruck: string;
  readonly footerDeadCodeAfter: string;
}

interface UiStrings {
  /** Accessible name of the language switcher. */
  readonly languageSwitcherLabel: string;
  /** Native name of the language, shown to visitors switching to it. */
  readonly languageName: string;
  readonly home: HomeStrings;
}

/** Every user-facing string of the site, per locale. */
export const UI: Readonly<Record<Locale, UiStrings>> = {
  fr: {
    languageSwitcherLabel: 'Langue',
    languageName: 'Français',
    home: {
      warningTape: 'PERSONNEL AUTORISÉ UNIQUEMENT',
      jobTitle: 'Développeur backend / Data Engineer',
      zone: 'Zone expérimentale',
      pitch: [
        { strong: '15+ ans de backend' },
        ", et un faible pour les traitements trop lents et les données en désordre. J'ai notamment ramené ",
        { strong: 'de plus de 3 minutes à moins de 5 secondes' },
        " un module qu'on croyait cassé, alors qu'il était juste désespérément lent. Je construis des ",
        { strong: 'pipelines de données fiables' },
        ', et je monte en compétences sur la ',
        { strong: 'stack Data Engineering moderne' },
        ' (orchestration, modélisation analytique).',
      ],
      warningLabel: '// ATTENTION',
      warningIntro: [
        'Vous êtes entré dans un ',
        { em: 'environnement de développement actif' },
        '.',
      ],
      warningEffects: [
        'Effets secondaires possibles : ',
        { em: 'logiciels qui fonctionnent' },
        ', ',
        { em: 'architecture propre' },
        ', ',
        { em: 'tests automatisés' },
        ', et une obsession malsaine pour la ',
        { em: 'qualité du code' },
        '.',
      ],
      warningOutro: 'Poursuivez à vos risques et périls',
      githubLink: 'GitHub',
      footerSite: 'marvinlerouge.dev',
      footerHarm: "aucun humain n'a été maltraité pendant la fabrication de cette page",
      footerDeadCodeBefore: 'aucun',
      footerDeadCodeStruck: 'corps',
      footerDeadCodeAfter: 'code mort trouvé.',
    },
  },
  en: {
    languageSwitcherLabel: 'Language',
    languageName: 'English',
    home: {
      warningTape: 'AUTHORIZED PERSONNEL ONLY',
      jobTitle: 'Backend Developer / Data Engineer',
      zone: 'Experimental zone',
      pitch: [
        { strong: '15+ years of backend development' },
        ', and a soft spot for slow processes and messy data. Among other things, I took a module thought to be broken, when it was just painfully slow, ',
        { strong: 'from over 3 minutes down to under 5 seconds' },
        '. I build ',
        { strong: 'reliable data pipelines' },
        ", and I'm currently upskilling on the ",
        { strong: 'modern Data Engineering stack' },
        ' (orchestration, analytical modeling).',
      ],
      warningLabel: '// WARNING',
      warningIntro: ['You have entered a ', { em: 'live development environment' }, '.'],
      warningEffects: [
        'Side effects may include: ',
        { em: 'working software' },
        ', ',
        { em: 'clean architecture' },
        ', ',
        { em: 'automated tests' },
        ', and an unhealthy obsession with ',
        { em: 'code quality' },
        '.',
      ],
      warningOutro: 'Proceed at your own risk',
      githubLink: 'GitHub',
      footerSite: 'marvinlerouge.dev',
      footerHarm: 'no humans were harmed in the making of this page',
      footerDeadCodeBefore: 'no',
      footerDeadCodeStruck: 'remains',
      footerDeadCodeAfter: 'dead code found.',
    },
  },
};
