package de.fhg.iais.roberta.ast;

import java.util.Collections;

import org.junit.Test;

import de.fhg.iais.roberta.components.ConfigurationComponent;
import de.fhg.iais.roberta.syntax.sensor.generic.TemperatureSensor;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.visitor.collect.AbstractUsedHardwareCollectorVisitor;

public class ConfigCompTest extends AstTest {

    private static class TestConfiguration extends AbstractUsedHardwareCollectorVisitor {
        //TODO create fake for this class
        TestConfiguration() {
            super(null, null);
        }

        @Override
        public Void visitTemperatureSensor(TemperatureSensor<Void> temperatureSensor) {
            return null;
        }
    }

    @Test(expected = DbcException.class)
    public void connectionTest() throws Exception {
        TestConfiguration testConfiguration = new TestConfiguration();
        ConfigurationComponent configComp = new ConfigurationComponent("type", false, "port", "userPort", Collections.emptyMap());
        Assert.isTrue(configComp.getProperty().getBlockType().equals("type"));
        configComp.accept(testConfiguration);
    }
}
