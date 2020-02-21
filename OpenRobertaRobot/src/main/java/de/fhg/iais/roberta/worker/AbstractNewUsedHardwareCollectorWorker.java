package de.fhg.iais.roberta.worker;
import java.util.ArrayList;
import java.util.List;

import de.fhg.iais.roberta.bean.NewUsedHardwareBean;
import de.fhg.iais.roberta.components.Project;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.collect.AbstractNewUsedHardwareCollectorVisitor;

public abstract class AbstractNewUsedHardwareCollectorWorker implements IWorker {

    /**
     * Returns the appropriate visitor for this worker. Used by subclasses to keep the execute method generic.
     * Could be removed in the future, when visitors are specified in the properties as well, or inferred from the worker name.
     *
     * @param builder the used hardware bean builder
     * @return the appropriate visitor for the current robot
     */
    protected abstract AbstractNewUsedHardwareCollectorVisitor getVisitor(NewUsedHardwareBean.Builder builder);

    @Override
    public void execute(Project project) {
        NewUsedHardwareBean.Builder builder = new NewUsedHardwareBean.Builder();
        AbstractNewUsedHardwareCollectorVisitor visitor = getVisitor(builder);
        List<ArrayList<Phrase<Void>>> tree = project.getProgramAst().getTree();
        collectGlobalVariables(tree, visitor);
        for ( List<Phrase<Void>> phrases : tree ) {
            for ( Phrase<Void> phrase : phrases ) {
                if ( !phrase.getKind().getName().equals("MAIN_TASK") ) {
                    phrase.accept(visitor);
                }
            }
        }
        project.appendWorkerResult(builder.build());
    }

    protected static void collectGlobalVariables(List<ArrayList<Phrase<Void>>> phrasesSet, IVisitor<Void> visitor) {
        for ( List<Phrase<Void>> phrases : phrasesSet ) {
            Phrase<Void> phrase = phrases.get(1);
            if ( phrase.getKind().getName().equals("MAIN_TASK") ) {
                phrase.accept(visitor);
            }
        }
    }
}
