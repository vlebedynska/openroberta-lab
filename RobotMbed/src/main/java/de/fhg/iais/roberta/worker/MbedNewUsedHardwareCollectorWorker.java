package de.fhg.iais.roberta.worker;

import de.fhg.iais.roberta.bean.NewUsedHardwareBean;
import de.fhg.iais.roberta.visitor.collect.AbstractNewUsedHardwareCollectorVisitor;
import de.fhg.iais.roberta.visitor.collect.MbedNewUsedHardwareCollectorVisitor;

public final class MbedNewUsedHardwareCollectorWorker extends AbstractNewUsedHardwareCollectorWorker {
    @Override
    protected AbstractNewUsedHardwareCollectorVisitor getVisitor(NewUsedHardwareBean.Builder builder) {
        return new MbedNewUsedHardwareCollectorVisitor(builder);
    }
}