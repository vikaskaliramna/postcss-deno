import LanguageConstructor from './lib/Content-Processor/Constructor.TS';




const CustomConstructor = new LanguageConstructor();

const Process = CustomConstructor.process(await Deno.readTextFile('Example/BootstrapV5.CSS'));

console.log(Process.css);