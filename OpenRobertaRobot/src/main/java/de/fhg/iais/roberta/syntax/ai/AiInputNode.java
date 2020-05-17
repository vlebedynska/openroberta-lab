package de.fhg.iais.roberta.syntax.ai;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.sensor.ExternalSensor;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

import java.util.List;

public abstract class AiInputNode<V> extends AiNode<V> {

    protected final ExternalSensor<V> externalSensor;


    protected AiInputNode(BlockType kind, ExternalSensor<V> externalSensor, Integer threshold, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, threshold, property, comment);
        this.externalSensor = externalSensor;
        setReadOnly();
    }


}
