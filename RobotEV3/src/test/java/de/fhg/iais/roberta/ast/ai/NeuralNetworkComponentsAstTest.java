package de.fhg.iais.roberta.ast.ai;

import org.junit.Ignore;
import org.junit.Test;

import de.fhg.iais.roberta.ast.AstTest;
import de.fhg.iais.roberta.util.test.UnitTestHelper;

public class NeuralNetworkComponentsAstTest extends AstTest {

    @Test
    public void validateInputNode() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=188,y=337],AiInput[UltrasonicSensor[1,DISTANCE,NO_SLOT],Threshold=0]]]]";
        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/input_node.xml");
    }
    @Ignore
    @Test
    public void validateOutputNode() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=-1188,y=-387],AiOutput[TODO]]]]";

        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/output_node.xml");
    }
    @Ignore
    @Test
    public void validateNeuralNetwork() throws Exception {
        String a =
            "BlockAST[project=[[Location[x=-1238,y=-387],AiNeuralNetwork[TODO]]]]";

        UnitTestHelper.checkProgramAstEquality(testFactory, a, "/ast/ai/ai_neural_network_test.xml");
    }


    @Ignore
    @Test
    public void reverseTransformation() throws Exception {
        UnitTestHelper.checkProgramReverseTransformation(testFactory, "/ast/sensors/sensor_setUltrasonic.xml");
    }

}
