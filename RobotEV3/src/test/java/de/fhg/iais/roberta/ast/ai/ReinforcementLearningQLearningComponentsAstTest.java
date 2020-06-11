package de.fhg.iais.roberta.ast.ai;

import de.fhg.iais.roberta.ast.AstTest;
import de.fhg.iais.roberta.util.test.UnitTestHelper;
import org.junit.Ignore;
import org.junit.Test;

public class ReinforcementLearningQLearningComponentsAstTest extends AstTest {

    @Test
    public void validateRlEnvironment() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=122,y=43],MainTask[],RlEnvironment[Startnode:0Finish-Node:8Obstacles:ListCreate[OBSTACLE,EmptyExpr[defVal=ARRAY],EmptyExpr[defVal=ARRAY],EmptyExpr[defVal=ARRAY]]]]]]";
        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/reinforcementLearning/ai_q_learning_states_and_actions_map.xml");
    }

    @Test
    public void validateRlObstacle() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=88,y=113],RlObstacle[Startnode:0Finish-Node:8]]]]";
        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/reinforcementLearning/ai_q_barrier_mountain.xml");
    }

    @Test
    public void validateRlAIQLearnerConfig() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=63,y=88],RlSetUpQLearningBehaviour[alpha:0.1gamma:0.2nu:0.1rho:0.1]]]]";
        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/reinforcementLearning/ai_q_learner_config.xml");
    }

    @Test
    public void validateRlAIGainExperience() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=63,y=188],RlGainExperience[Nothingtoconvert:]]]]";
        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/reinforcementLearning/ai_q_gain_experience.xml");
    }

    @Ignore
    @Test
    public void validateRlAIQDriveTheBestWay() throws Exception {
        String a =
            "TestTest";
        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/reinforcementLearning/ai_q_drive_the_best_way.xml");
    }

    @Test
    public void validateRlDrawOptimalPath() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=114,y=48],MainTask[],RlDrawOptimalPath[]]]]";
        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/reinforcementLearning/ai_q_draw_optimal_path.xml");
    }

}
