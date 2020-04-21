package de.fhg.iais.roberta.syntax.ai;

import static de.fhg.iais.roberta.syntax.sensor.ExternalSensor.extractPortAndModeAndSlot;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.sensor.SensorMetaDataBean;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.visitor.IVisitor;

/**
    TODO Doku
 */
public abstract class AiNode<V> extends Phrase<V> {

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind     of the the object used in AST,
     * @param property
     * @param comment  that the user added to the block
     */
    public AiNode(BlockType kind, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, property, comment);
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + "TODO" + "]";
    }

}


