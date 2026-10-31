use pw_solver_engine::cfr::*;
use pw_solver_engine::games::{kuhn::Kuhn, leduc::Leduc};
fn main() {
    for (name, params) in [("dcfr", DcfrParams::RECOMMENDED), ("vanilla", DcfrParams::VANILLA)] {
        let g = Kuhn; let mut s = Solver::new(&g, params);
        let mut line = format!("kuhn {name}:");
        for checkpoint in [10u64, 100, 1000, 5000] { while s.iterations() < checkpoint { s.iterate(); } let p = s.average_policy(); line += &format!(" {}={:.5}/{:.5}", checkpoint, exploitability(&g,&p), expected_value(&g,&p,0)); }
        println!("{line}");
        let g = Leduc; let mut s = Solver::new(&g, params);
        let mut line = format!("leduc {name}:");
        for checkpoint in [10u64, 100, 1000, 3000] { while s.iterations() < checkpoint { s.iterate(); } let p = s.average_policy(); line += &format!(" {}={:.5}/{:.5}", checkpoint, exploitability(&g,&p), expected_value(&g,&p,0)); }
        println!("{line}");
    }
}
