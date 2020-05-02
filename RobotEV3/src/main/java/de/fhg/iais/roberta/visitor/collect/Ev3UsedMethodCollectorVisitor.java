package de.fhg.iais.roberta.visitor.collect;

import de.fhg.iais.roberta.bean.UsedMethodBean;
import de.fhg.iais.roberta.syntax.ai.AiNeuralNetwork;

public class Ev3UsedMethodCollectorVisitor extends AbstractUsedMethodCollectorVisitor implements IEv3CollectorVisitor {
    public Ev3UsedMethodCollectorVisitor(UsedMethodBean.Builder builder) {
        super(builder);
    }

    @Override public Void visitAiNeuralNetwork(AiNeuralNetwork<Void> voidAiNeuralNetwork) {
        return null;
    }
}
