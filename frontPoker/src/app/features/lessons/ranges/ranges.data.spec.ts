import expertRanges from '../../../../../../backPoker/resources/lessons/ranges-expert.json';
import {
  BEGINNER_CHARTS,
  EXPERT_RANGE_TITLES,
  INTERMEDIATE_CHARTS,
  RANKS,
  RangeChart,
  cellHand,
  combos,
  expandRange,
  rangePercent,
} from './ranges.data';

const ALL_HANDS = RANKS.flatMap((_, row) => RANKS.map((__, col) => cellHand(row, col)));
const expert = expertRanges as RangeChart[];
const percent = (chart: RangeChart, i = 0) => rangePercent(chart.actions[i].hands);

describe('Tableaux de ranges', () => {
  describe('notation', () => {
    it('développe les paires, les « + » et les intervalles', () => {
      expect(expandRange('TT+')).toEqual(['AA', 'KK', 'QQ', 'JJ', 'TT']);
      expect(expandRange('99-77')).toEqual(['99', '88', '77']);
      expect(expandRange('ATs+')).toEqual(['AKs', 'AQs', 'AJs', 'ATs']);
      expect(expandRange('K8s-K6s')).toEqual(['K8s', 'K7s', 'K6s']);
      expect(expandRange('KQ')).toEqual(['KQs', 'KQo']);
      expect(expandRange('AJ+').length).toBe(6);
    });

    it('refuse une notation erronée au lieu de l’ignorer', () => {
      expect(() => expandRange('TAs')).toThrowError(/Carte haute/);
      expect(() => expandRange('AAs')).toThrowError(/paire/);
      expect(() => expandRange('AKx')).toThrowError(/inconnue/);
    });

    it('couvre les 169 mains et les 1 326 combinaisons', () => {
      expect(new Set(ALL_HANDS).size).toBe(169);
      expect(ALL_HANDS.reduce((sum, h) => sum + combos(h), 0)).toBe(1326);
      expect(cellHand(0, 1)).toBe('AKs');
      expect(cellHand(1, 0)).toBe('AKo');
    });
  });

  describe('contenu', () => {
    for (const chart of [...BEGINNER_CHARTS, ...INTERMEDIATE_CHARTS, ...expert]) {
      it(`« ${chart.title} » : notation valide, aucune main dans deux actions`, () => {
        const seen = new Set<string>();
        for (const action of chart.actions) {
          for (const hand of expandRange(action.hands)) {
            expect(seen.has(hand)).withContext(`${hand} en double`).toBeFalse();
            expect(ALL_HANDS).toContain(hand);
            seen.add(hand);
          }
        }
      });
    }

    it('suit les ordres de grandeur annoncés par la leçon « ranges par position »', () => {
      const [utg, hj, co, btn, sb] = INTERMEDIATE_CHARTS;

      expect(percent(utg)).toBeGreaterThanOrEqual(15);
      expect(percent(utg)).toBeLessThanOrEqual(18);
      expect(percent(co)).toBeGreaterThanOrEqual(25);
      expect(percent(co)).toBeLessThanOrEqual(30);
      expect(percent(btn)).toBeGreaterThanOrEqual(40);
      expect(percent(btn)).toBeLessThanOrEqual(50);
      expect(percent(hj)).toBeGreaterThan(percent(utg));
      expect(percent(hj)).toBeLessThan(percent(co));
      expect(percent(sb)).toBeGreaterThan(percent(co));
      expect(percent(sb)).toBeLessThan(percent(btn));
    });

    it('chaque position reprend toute la range de la précédente', () => {
      for (const charts of [BEGINNER_CHARTS, INTERMEDIATE_CHARTS.slice(0, 4)]) {
        for (let i = 1; i < charts.length; i++) {
          const wider = new Set(expandRange(charts[i].actions[0].hands));
          for (const hand of expandRange(charts[i - 1].actions[0].hands)) {
            expect(wider.has(hand)).withContext(`${hand} absent de ${charts[i].title}`).toBeTrue();
          }
        }
      }
    });

    it('garde les repères débutants plus serrés que les ranges complètes', () => {
      expect(percent(BEGINNER_CHARTS[0])).toBeLessThan(percent(INTERMEDIATE_CHARTS[0]));
      expect(percent(BEGINNER_CHARTS[2])).toBeLessThan(percent(INTERMEDIATE_CHARTS[3]));
    });

    it("annonce les tableaux Expert tels que l'API les sert, sans embarquer leurs mains", () => {
      expect(expert.map((c) => c.title)).toEqual(EXPERT_RANGE_TITLES);
      expect(expert.every((c) => c.id.startsWith('expert-'))).toBeTrue();
    });
  });
});
