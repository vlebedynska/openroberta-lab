package de.fhg.iais.roberta.syntax.ai;

import de.fhg.iais.roberta.syntax.BlockType;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.syntax.lang.expr.ListCreate;

/**
    TODO Doku
 */
public class AiLink<V> {

    private int weight;
    private final Expr<V> node1;
    private final Expr<V> node2;

    public Expr<V> getNode1() {
        return node1;
    }

    public Expr<V> getNode2() {
        return node2;
    }

    public int getWeight() {
        return weight;
    }

    public AiLink(Expr<V> node1,  Expr<V> node2, int weight) {
        this.weight = weight;
        this.node1 = node1;
        this.node2 = node2;
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + "TODO" + "]";
    }

}


