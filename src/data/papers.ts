// src/data/papers.ts
import type { AIPaperSummary } from "../lib/ai";

export const PAPERS: {
  id: number;
  title: string;
  author: string;
  field: string;
  readTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  abstract: string;
  aiSummary?: AIPaperSummary;
}[] = [
  {
    id: 1,
    title: "The Effects of Urban Green Space on Mental Health",
    author: "Dr. Elena S. Rivas, et al.",
    field: "Environmental Psychology",
    readTime: "12 min",
    difficulty: "Medium",
    abstract:
      "A comprehensive analysis of cortisol levels in urban populations and how access to parks and trees reduces stress.",
    aiSummary: {
      title: "The Effects of Urban Green Space on Mental Health",
      authors: ["Elena S. Rivas", "Co-authors"],

      abstract: {
        beginner:
          "Living near parks and trees helps people feel less stressed. This study looked at people living in cities and found that those who spent time in green spaces had lower levels of a stress hormone called cortisol. Nature acts like a buffer against the busyness and noise of city life.",
        intermediate:
          "This study investigates the correlation between accessibility to urban green spaces and reductions in psychophysiological stress markers. Using salivary cortisol sampling, researchers found a statistically significant inverse relationship: as exposure to vegetation increased, reported anxiety and cortisol levels decreased. The findings suggest that urban planning should prioritize biological integration.",
        expert:
          "A longitudinal analysis (n = 2,500) quantifies the impact of urban vegetation density on HPA axis regulation. Utilizing salivary cortisol assays and GPS tracking, the data show a correlation coefficient of approximately −0.45 between vegetation index (NDVI) and chronic stress markers. Confounders such as socioeconomic status are controlled via multivariate regression.",
      },

      sections: [
        {
          label: "Background & Motivation",
          beginner:
            "City life can be loud, crowded, and stressful. The researchers wanted to know whether easy access to trees, grass, and parks could help people feel calmer and healthier.",
          intermediate:
            "Urbanization increases exposure to stressors such as noise, crowding, and pollution. The authors hypothesize that everyday exposure to vegetation and natural settings can buffer these effects by lowering physiological arousal.",
          expert:
            "Drawing on biophilia and attention restoration theory, the paper frames urban green space as an environmental moderator in stress models. The authors propose that vegetative density modulates HPA axis activation, leading to measurable differences in cortisol secretion patterns.",
        },
        {
          label: "Methods & Data",
          beginner:
            "Researchers followed 2,500 city residents over time, tracked how much green space they had nearby, and took small saliva samples to measure cortisol (a stress hormone).",
          intermediate:
            "The study tracks 2,500 residents using GPS-enabled smartphones to estimate average daily exposure to green areas, combined with periodic salivary cortisol sampling and self-reported stress surveys.",
          expert:
            "Exposure is operationalized using NDVI-based satellite imagery and GPS traces. Salivary cortisol samples are collected at multiple time points, and mixed-effects models account for within-subject variability and neighborhood-level clustering.",
        },
        {
          label: "Results & Implications",
          beginner:
            "People with more nearby green space had lower stress levels. The authors argue that city planners should include more parks, trees, and walking paths to support mental health.",
          intermediate:
            "Higher vegetation exposure is associated with lower average cortisol and reduced self-reported stress. The authors highlight the role of green infrastructure as a low-cost mental health intervention.",
          expert:
            "The paper reports a robust negative association (r ≈ −0.45) between NDVI scores and chronic cortisol levels, even after controlling for income, age, and baseline health. The authors recommend integrating green space metrics into public health and zoning policy.",
        },
      ],

      research_details: {
        research_question:
          "How does access to urban green space influence physiological stress levels, particularly cortisol, among city residents?",
        domain: "Environmental psychology and urban public health",
        methodology:
          "The study employs a longitudinal design, following a cohort of approximately 2,500 urban residents over multiple months. Participants provide repeated salivary samples for cortisol analysis while their daily movements are tracked via GPS-enabled smartphones. Vegetation exposure is quantified using NDVI metrics derived from satellite imagery, and perceived stress is measured with validated self-report questionnaires.\n\nMultivariate regression and mixed-effects models are used to estimate the relationship between vegetation exposure and stress outcomes, while controlling for key covariates such as age, gender, income, baseline health status, and neighborhood socioeconomic indicators.",
        data:
          "Data include repeated salivary cortisol measurements for each participant, GPS traces of daily movement, NDVI-based estimates of local vegetation, and survey responses on perceived stress and mental well-being. Neighborhood-level indicators, such as population density and median income, are incorporated to account for contextual effects.\n\nThe dataset is structured hierarchically, with individuals nested within neighborhoods, enabling the use of multilevel models to separate within-person variation from between-neighborhood differences in green space availability.",
        key_results:
          "Higher levels of exposure to urban vegetation are consistently associated with lower chronic cortisol levels and reduced self-reported stress. The estimated correlation between NDVI scores and cortisol is around −0.45, and this relationship remains statistically significant after adjusting for socioeconomic status and other confounders.\n\nThe results suggest that relatively modest increases in accessible green space can yield measurable mental health benefits at the population level. The findings support the view that parks, trees, and other forms of green infrastructure should be treated as essential components of urban health policy rather than optional amenities.",
        limitations:
          "The study is observational, which limits the ability to infer strict causality between green space exposure and changes in cortisol. Unmeasured confounders—such as individual preferences for greener neighborhoods or unrecorded health behaviors—may influence both residential choices and stress outcomes.\n\nAdditionally, exposure is inferred from GPS and NDVI rather than direct measures of time spent in nature, and the sample is drawn from a specific set of metropolitan areas, which may limit generalizability to other cultural or climatic contexts.",
        future_work:
          "Future research could incorporate experimental or quasi-experimental designs, such as natural experiments where new parks are introduced, to strengthen causal claims. More granular tracking of time spent actively engaging with green spaces (e.g., walking vs. simply living nearby) would help disentangle different modes of exposure.\n\nThe authors also suggest extending the analysis to other health outcomes such as sleep quality, cardiovascular markers, and workplace productivity, as well as exploring which types of green infrastructure (street trees, community gardens, large parks) provide the greatest benefit per unit cost.",
      },

      key_takeaways: [
        "Greater access to urban green space is linked to lower physiological stress, as measured by salivary cortisol.",
        "The study uses a relatively large longitudinal sample (n ≈ 2,500) with objective GPS and NDVI measures of vegetation exposure.",
        "Green infrastructure acts as a low-cost, population-level mental health intervention.",
        "Urban planning decisions can be treated as public health tools, not merely aesthetic choices.",
      ],

      quiz: [
        {
          question: "Which stress hormone is measured in this study?",
          options: ["Insulin", "Cortisol", "Adrenaline"],
          answer_index: 1,
          explanation:
            "Salivary cortisol is used as a physiological marker of stress in the participants.",
        },
        {
          question:
            "What is the main relationship between green space and stress in this paper?",
          options: [
            "More green space → more stress",
            "More green space → less stress",
            "There is no relationship",
          ],
          answer_index: 1,
          explanation:
            "The study finds an inverse relationship: as exposure to green space increases, physiological and self-reported stress decrease.",
        },
      ],
    },
  },

  {
    id: 2,
    title: "CRISPR-Cas9: Gene Editing Mechanics",
    author: "J. Doudna, E. Charpentier",
    field: "Biotechnology",
    readTime: "18 min",
    difficulty: "Hard",
    abstract:
      "Explores how the CRISPR-Cas9 system uses guide RNA and the Cas9 enzyme to cut DNA at specific locations for gene editing.",
    aiSummary: {
      title: "CRISPR-Cas9: Gene Editing Mechanics",
      authors: ["Jennifer Doudna", "Emmanuelle Charpentier"],

      abstract: {
        beginner:
          "CRISPR is like a pair of molecular scissors. It lets scientists cut DNA at a very specific spot. The system was first found in bacteria, which use it to chop up virus DNA. Now we can use it to try and fix genetic diseases by cutting out or replacing 'bad' sections of DNA.",
        intermediate:
          "The CRISPR-Cas9 system uses a guide RNA to direct the Cas9 nuclease to a complementary DNA sequence. Once bound, Cas9 introduces a double-strand break. Cellular repair pathways then respond, either knocking out the gene through error-prone repair or inserting a new DNA template supplied by the researcher.",
        expert:
          "Type II CRISPR-Cas9 forms a ribonucleoprotein complex in which the sgRNA base-pairs with the target protospacer adjacent to a PAM motif. The HNH domain cleaves the complementary DNA strand while the RuvC-like domain cleaves the non-complementary strand, generating a blunt double-strand break suitable for NHEJ or HDR-based editing.",
      },

      sections: [
        {
          label: "System Overview",
          beginner:
            "CRISPR works like a GPS-guided pair of scissors: the RNA is the GPS, and the Cas9 protein is the scissor.",
          intermediate:
            "The system couples a programmable guide RNA with the Cas9 nuclease to enable sequence-specific DNA cleavage in living cells.",
          expert:
            "Single guide RNAs (sgRNAs) combine crRNA and tracrRNA components, simplifying targeting while maintaining the requirement for a 5'-NGG-3' PAM for Cas9 binding and activation.",
        },
        {
          label: "Mechanism of DNA Cutting",
          beginner:
            "When the guide RNA finds the matching DNA, Cas9 cuts both strands at that spot.",
          intermediate:
            "Upon binding the target, Cas9 undergoes a conformational change that activates its nuclease domains, creating a double-strand break at a defined position relative to the PAM.",
          expert:
            "Structural studies show repositioning of the HNH domain upon RNA–DNA hybrid formation, allowing concerted cleavage of both strands with precise offset from the PAM site.",
        },
        {
          label: "Applications & Risks",
          beginner:
            "Scientists can turn off genes or try to fix them. But there’s a risk of cutting the wrong place by accident (off-target effects).",
          intermediate:
            "CRISPR enables gene knockouts, precise edits, and functional screens, but off-target cleavage and mosaicism remain major safety concerns.",
          expert:
            "Off-target risk is mitigated by high-fidelity Cas9 variants, truncated guides, and careful sgRNA design, yet clinical translation still requires comprehensive off-target profiling.",
        },
      ],

      research_details: {
        research_question:
          "How does the CRISPR-Cas9 system achieve sequence-specific DNA cleavage, and what design parameters control its efficiency and specificity for gene editing applications?",
        domain:
          "Molecular biology and genome engineering, focusing on RNA-guided endonucleases",
        methodology:
          "The paper synthesizes biochemical assays, structural biology data, and cell-based gene editing experiments to characterize the Cas9 nuclease. In vitro cleavage assays are used to measure cutting efficiency at different target sequences and PAM contexts, while mutational analysis of the HNH and RuvC-like domains clarifies their individual contributions to double-strand break formation.\n\nStructural studies, including X-ray crystallography and cryo-EM, resolve the conformational states of Cas9 bound to sgRNA and target DNA, revealing how PAM recognition and RNA–DNA hybrid formation trigger nuclease activation. Complementary experiments in eukaryotic cells demonstrate practical editing outcomes such as gene knockouts and targeted insertions.",
        data:
          "Experimental data include kinetic measurements of DNA cleavage for panels of target sequences and PAM variants, binding affinities between Cas9, sgRNA, and DNA substrates, and structural models of Cas9 in pre- and post-cleavage states. Cell culture experiments provide rates of insertion/deletion mutations and homologous recombination when donor templates are supplied.\n\nThe dataset spans bacterial, yeast, and mammalian systems, allowing comparison of editing efficiencies across different genomic contexts and chromatin environments. Off-target activity is evaluated using targeted sequencing of candidate loci and, in some cases, unbiased genome-wide assays.",
        key_results:
          "The study demonstrates that Cas9 can be programmed to cut virtually any DNA sequence adjacent to a compatible PAM by altering the spacer region of the sgRNA. The HNH and RuvC-like domains are shown to cleave complementary and non-complementary strands, respectively, producing a precise double-strand break.\n\nThe authors show that editing efficiency depends on factors such as sgRNA–target complementarity, PAM identity, and chromatin accessibility. They also report detectable off-target cleavage at sequences with partial complementarity, highlighting the tradeoff between ease of programming and specificity.",
        limitations:
          "The work primarily characterizes first-generation Cas9 from Streptococcus pyogenes, which requires an NGG PAM and can exhibit off-target activity at near-matching sequences. The in vitro and cell culture experiments may not fully predict behavior in complex tissues or whole organisms.\n\nAdditionally, delivery challenges—such as packaging the relatively large Cas9 protein and sgRNA into viral vectors—are only partially addressed. Long-term genomic stability, immune responses to Cas9, and ethical concerns around germline editing remain outside the scope of the core mechanistic study.",
        future_work:
          "Future directions include engineering high-fidelity Cas9 variants with reduced off-target activity, expanding the range of targetable sequences through alternative PAM specificities, and developing novel editors such as base editors and prime editors that can modify DNA without creating double-strand breaks.\n\nThe authors also point toward translational work in animal models and human cells, including ex vivo editing of hematopoietic stem cells and in vivo delivery strategies. More comprehensive genome-wide profiling methods are needed to map off-target events and establish safety thresholds for clinical applications.",
      },

      key_takeaways: [
        "CRISPR-Cas9 functions as a programmable, RNA-guided DNA endonuclease capable of introducing precise double-strand breaks.",
        "Guide RNA base-pairing and PAM recognition jointly determine where Cas9 cuts, enabling flexible targeting but also creating off-target risk when near matches exist.",
        "Structural and biochemical studies explain how conformational changes in Cas9 activate its nuclease domains upon correct target recognition.",
        "Clinical translation requires careful control of specificity, efficient delivery systems, and robust off-target detection methods.",
      ],

      quiz: [
        {
          question: "What tells Cas9 where to cut?",
          options: ["Protein domain", "Guide RNA", "PAM motif alone"],
          answer_index: 1,
          explanation:
            "The guide RNA base-pairs with the target DNA and directs Cas9 to the correct sequence; PAM is required but not sufficient by itself.",
        },
        {
          question: "What does Cas9 physically do?",
          options: [
            "Replicates DNA",
            "Cuts both strands of DNA",
            "Transcribes RNA",
          ],
          answer_index: 1,
          explanation:
            "Cas9 is a nuclease that introduces a double-strand break in the DNA, which the cell then repairs.",
        },
      ],
    },
  },

  {
    id: 3,
    title: "The Economic Impact of AI Automation",
    author: "Global Economic Forum",
    field: "Economics",
    readTime: "9 min",
    difficulty: "Medium",
    abstract:
      "Forecasts how AI-driven automation will displace routine work, create new roles, and change wage distributions over the next decade.",
    aiSummary: {
      title: "The Economic Impact of AI Automation",
      authors: ["Global Economic Forum Working Group on AI and Labor"],

      abstract: {
        beginner:
          "Robots and AI will change how we work. Some jobs that are very repetitive may disappear, but new jobs will be created. The big idea is that machines will handle boring tasks, while people focus more on creative and social work. To keep up, workers need to learn new skills.",
        intermediate:
          "Automation primarily targets routine cognitive and manual tasks, displacing workers in the short run. However, productivity gains can lower costs and increase demand for new services, which creates different jobs. The key challenge is whether workers can reskill fast enough to move into these new roles.",
        expert:
          "Using a task-based model of labor demand, the paper argues that high-elasticity sectors experience labor augmentation, while routine-task sectors face substitution. In the transition, wage polarization occurs as returns to capital (and high-skill labor) outpace returns to routine labor, consistent with r > g dynamics.",
      },

      sections: [
        {
          label: "Which Tasks Are Affected?",
          beginner:
            "Tasks that are repetitive and predictable are easiest to automate.",
          intermediate:
            "Routine, rules-based tasks (both manual and cognitive) are most vulnerable to AI-driven automation.",
          expert:
            "Routine-intensive occupations with codifiable tasks see the largest displacement effects, while non-routine analytical and interpersonal tasks are relatively insulated.",
        },
        {
          label: "New Jobs & Productivity",
          beginner:
            "Even when some jobs go away, new kinds of work appear because companies can offer more and cheaper services.",
          intermediate:
            "Productivity effects generate new demand: lower production costs can expand markets, creating jobs in complementary services and new industries.",
          expert:
            "Endogenous demand responses mean that aggregate employment effects depend on the elasticity of substitution between automated and non-automated tasks.",
        },
        {
          label: "Policy & Reskilling",
          beginner:
            "Governments and schools need to help people learn new skills so they can move into better jobs created by AI.",
          intermediate:
            "Education and training systems must adapt to focus on transferable, non-routine skills to reduce frictions in labor reallocation.",
          expert:
            "The paper highlights targeted retraining, lifelong learning incentives, and safety-net design as key levers to mitigate transitional inequality.",
        },
      ],

      research_details: {
        research_question:
          "How will AI-driven automation reshape the task composition of jobs, overall employment, and wage distributions across skill groups over the next decade?",
        domain:
          "Labor economics and macroeconomics, with a focus on technological change and inequality",
        methodology:
          "The paper builds a task-based model in which occupations are represented as bundles of routine and non-routine tasks. AI and robotics are modeled as technologies that substitute for routine tasks while augmenting certain high-skill, non-routine activities. The authors calibrate the model using sector-level productivity data and occupation-level task intensities.\n\nScenario analysis is conducted by simulating different adoption rates of AI technologies and varying elasticities of substitution between automated and non-automated tasks. The model is linked to empirical estimates from historical automation episodes to constrain plausible ranges for job displacement and wage responses.",
        data:
          "Empirical inputs include labor force survey data describing employment by occupation and skill level, productivity statistics by industry, and wage distributions over the past two decades. Task-intensity scores from existing classifications (e.g., routine vs. non-routine cognitive/manual) are used to map occupations into the model.\n\nThe paper also incorporates case studies from sectors such as manufacturing, logistics, and business services, where AI and robotics deployments are already measurable. These case studies provide concrete examples of job redesign, new roles created, and changes in required skill sets.",
        key_results:
          "Model simulations suggest that routine-intensive middle-skill occupations experience the largest displacement, while high-skill analytical and low-skill non-routine manual jobs are more resilient. In the short to medium term, wage polarization emerges: earnings rise for highly skilled workers who complement AI, while wages stagnate or fall for routine workers.\n\nAt the same time, productivity gains can generate substantial aggregate income growth. If accompanied by sufficient demand and supportive policy, this growth can create new occupations in services, creative industries, and AI-related maintenance and oversight. The net employment effect therefore depends critically on the speed of reskilling and the responsiveness of product demand.",
        limitations:
          "The analysis relies on modeling assumptions about technology adoption, substitution elasticities, and future demand growth that may not fully capture real-world complexities. Unanticipated innovations or regulatory changes could alter the trajectory of automation and its labor-market impact.\n\nFurthermore, the data used to calibrate the model are drawn primarily from advanced economies, limiting direct applicability to emerging markets with different institutional settings, informality rates, and safety nets. The paper also abstracts from political feedback effects, such as how rising inequality might influence policy choices and regulations.",
        future_work:
          "Future research could integrate more granular microdata on firms and workers to study how AI adoption diffuses within industries and across regions. Linking employer-level adoption decisions to worker-level outcomes would allow for richer analysis of transition paths and distributional effects.\n\nThe authors also call for systematic evaluation of policy interventions—such as wage subsidies, portable benefits, and targeted retraining programs—through randomized trials or natural experiments. Incorporating climate and demographic shocks into the automation model is another promising direction, as these forces will interact with technological change in shaping the future of work.",
      },

      key_takeaways: [
        "AI automation disproportionately affects routine tasks, leading to substantial disruption in middle-skill occupations.",
        "Productivity gains from automation can create new jobs and industries, but the distribution of benefits is highly uneven.",
        "In the transition phase, wage polarization and increased inequality are likely unless policy actively supports reskilling and redistribution.",
        "Education, lifelong learning, and adaptive social safety nets are central to ensuring that workers can move into emerging roles created by AI.",
      ],

      quiz: [
        {
          question: "Which type of tasks are most vulnerable to automation?",
          options: ["Creative tasks", "Routine tasks", "Social interaction"],
          answer_index: 1,
          explanation:
            "Routine, repetitive tasks—both manual and cognitive—are easiest for algorithms and robots to learn and replicate.",
        },
        {
          question: "What is a key way to reduce negative impacts of automation?",
          options: ["Ban AI", "Keep wages fixed", "Invest in education/reskilling"],
          answer_index: 2,
          explanation:
            "Most economists emphasize investment in education and reskilling so workers can transition into new, less automatable roles.",
        },
      ],
    },
  },
];
