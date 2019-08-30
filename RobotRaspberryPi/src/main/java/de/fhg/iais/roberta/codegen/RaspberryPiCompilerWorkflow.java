package de.fhg.iais.roberta.codegen;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import de.fhg.iais.roberta.blockly.generated.BlockSet;
import de.fhg.iais.roberta.components.Configuration;
import de.fhg.iais.roberta.components.raspberrypi.RaspberryPiCommunicator;
import de.fhg.iais.roberta.factory.IRobotFactory;
import de.fhg.iais.roberta.inter.mode.action.ILanguage;
import de.fhg.iais.roberta.transformer.BlocklyProgramAndConfigTransformer;
import de.fhg.iais.roberta.transformer.raspberrypi.Jaxb2RaspberryPiConfigurationTransformer;
import de.fhg.iais.roberta.util.Key;
import de.fhg.iais.roberta.util.PluginProperties;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.util.jaxb.JaxbHelper;
import de.fhg.iais.roberta.visitor.codegen.RaspberryPiPythonVisitor;
import de.fhg.iais.roberta.visitor.validate.IValidatorVisitor;

public class RaspberryPiCompilerWorkflow extends AbstractCompilerWorkflow {

    private static final Logger LOG = LoggerFactory.getLogger(AbstractCompilerWorkflow.class);
    private final RaspberryPiCommunicator communicator;
    private List<IValidatorVisitor<Void>> validators;
    private final HelperMethodGenerator helperMethodGenerator; // TODO pull up to abstract compiler workflow once implemented for all robots

    public RaspberryPiCompilerWorkflow(PluginProperties pluginProperties, HelperMethodGenerator helperMethodGenerator) {
        super(pluginProperties);
        this.communicator = new RaspberryPiCommunicator(pluginProperties);
        this.helperMethodGenerator = helperMethodGenerator;
    }

    @Override
    public void loadValidatorVisitors(Configuration configuration) {
        LOG.debug("Loading validators...");
        String validatorsPropertyEntry = this.pluginProperties.getStringProperty("robot.plugin.validators");
        if ( validatorsPropertyEntry == null || validatorsPropertyEntry.equals("") ) {
            LOG.debug("No validators present.");
            this.validators = null;
            return;
        }
        List<String> validatorNames = Stream.of(this.pluginProperties.getStringProperty("robot.plugin.validators").split(",")).collect(Collectors.toList());
        List<IValidatorVisitor<Void>> validators = new ArrayList<>();
        validatorNames.forEach(validatorName -> {
            LOG.debug("Loading validator " + validatorName);
            try {
                validators.add((IValidatorVisitor<Void>) Class.forName(validatorName).getConstructor(Configuration.class).newInstance(configuration));
            } catch ( InstantiationException | IllegalAccessException | ClassNotFoundException | IllegalArgumentException | InvocationTargetException
                | NoSuchMethodException | SecurityException e ) {
                e.printStackTrace();
                throw new DbcException(
                    "Provided validator is not a validator, please validate that your provided validator is a validator that can perform validation.");
            }
        });
        boolean methodFound = false;
        for ( IValidatorVisitor<Void> validator : validators ) {
            Method[] methods = validator.getClass().getDeclaredMethods();
            for ( Method method : methods ) {
                if ( method.getName().equals("validate") ) {
                    LOG.debug("Validate method found for " + validator.getClass().getName());
                    methodFound = true;
                }
            }
            if ( !methodFound ) {
                throw new DbcException("validate method not found for validator " + validator.getClass().getName());
            }
        }
        this.validators = validators;
    }

    public List<IValidatorVisitor<Void>> getValidators() {
        return this.validators;
    }

    @Override
    public Map<String, String> getValidationResults() {
        Map<String, String> results = new HashMap<>();
        this.validators.forEach(validator -> {
            results.putAll(validator.getResult());
        });
        return results;
    }

    @Override
    public void generateSourceCode(String token, String programName, BlocklyProgramAndConfigTransformer data, ILanguage language) {
        loadValidatorVisitors(data.getRobotConfiguration());
        if ( this.validators != null ) {
            try {
                this.validators.forEach(validator -> {
                    validator.validate();
                });
            } catch ( DbcException e ) {
                this.workflowResult = Key.COMPILERWORKFLOW_ERROR_PROGRAM_GENERATION_FAILED_WITH_PARAMETERS;
                return;
            }
        }
        if ( data.getErrorMessage() != null ) {
            this.workflowResult = Key.COMPILERWORKFLOW_ERROR_PROGRAM_TRANSFORM_FAILED;
            return;
        }
        try {
            final Configuration configuration = data.getRobotConfiguration();
            this.generatedSourceCode =
                RaspberryPiPythonVisitor.generate(configuration, data.getProgramTransformer().getTree(), true, language, this.helperMethodGenerator);
            LOG.info("RaspberryPi code generated");
            this.workflowResult = Key.COMPILERWORKFLOW_SUCCESS;
        } catch ( Exception e ) {
            LOG.error("RaspberryPi code generation failed", e);
            this.workflowResult = Key.COMPILERWORKFLOW_ERROR_PROGRAM_GENERATION_FAILED;
        }
    }

    @Override
    public void compileSourceCode(String token, String programName, ILanguage language, Object flagProvider) {
        storeGeneratedProgram(token, programName, ".py");
        if ( this.workflowResult == Key.COMPILERWORKFLOW_SUCCESS ) {
            try {
                final String tempDir = this.pluginProperties.getTempDir();
                String programLocation = tempDir + token + File.separator + programName + File.separator + "source";
                this.communicator.uploadFile(programLocation, programName);
                this.workflowResult = Key.COMPILERWORKFLOW_SUCCESS;
            } catch ( Exception e ) {
                String ip = this.pluginProperties.getStringProperty("raspi.ip");
                LOG.error("Uploading the generated program to " + ip + " failed", e.getMessage());
                this.workflowResult = Key.RASPBERRY_PROGRAM_UPLOAD_ERROR;
            }
        }
    }

    @Override
    public Configuration generateConfiguration(IRobotFactory factory, String blocklyXml) throws Exception {
        final BlockSet project = JaxbHelper.xml2BlockSet(blocklyXml);
        final Jaxb2RaspberryPiConfigurationTransformer transformer = new Jaxb2RaspberryPiConfigurationTransformer(factory.getBlocklyDropdownFactory());
        return transformer.transform(project);
    }

    @Override
    public String getCompiledCode() {
        return null;
    }
}
