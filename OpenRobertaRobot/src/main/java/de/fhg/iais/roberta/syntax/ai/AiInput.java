package de.fhg.iais.roberta.syntax.ai;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.visitor.IVisitor;

/**
    TODO Doku
 */
public class AiInput<V> extends AiNode<V> {

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind     of the the object used in AST,
     * @param property
     * @param comment  that the user added to the block
     */
    public AiInput(BlockType kind, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, property, comment);
    }

    /**
    TODO Doku
     */
    public static <V> AiInput<V> make(Block block, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new AiInput<V>(BlockTypeContainer.getByName("AI_SENSOR"), properties, comment);
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return null; //TODO
    }

    @Override public Block astToBlock() {
        return null; //TODO
    }

    @Override
    public String toString() {
        return super.toString();
    }

    /**
     TODO Doku
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        return AiInput.make(block, helper.extractBlockProperties(block), helper.extractComment(block));
    }

}