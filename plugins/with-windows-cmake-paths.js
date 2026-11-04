const os = require("os");
const path = require("path");
const { withProjectBuildGradle } = require("@expo/config-plugins");

const MARKER = "// @iti/windows-cmake-paths";

/**
 * Expo/AGP passes -DCMAKE_OBJECT_PATH_MAX=1024, which disables CMake's
 * object-name shortening. On Windows, Ninja rejects any path longer than 260
 * characters, so builds fail when the project or node_modules path is deep.
 *
 * This plugin (Windows only):
 *   1. restores CMake's Windows default (250), letting it hash long object names;
 *   2. moves the CMake staging directory to a short path outside the project.
 *
 * It detects native modules through either `build.gradle` or `build.gradle.kts`,
 * plus a bare `CMakeLists.txt`, because newer libraries (react-native-worklets,
 * react-native-reanimated) declare their CMake build in Kotlin DSL.
 *
 * The Gradle hook must run before Expo's root plugin evaluates the subprojects,
 * so it is inserted before `apply plugin: "expo-root-project"`.
 */
function gradleBlock(stagingRoot) {
  const root = stagingRoot
    .replace(/\\/g, "/")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"');

  return `${MARKER}
// Windows native builds: keep CMake object paths under the 260-character limit.
subprojects { subproject ->
  def buildFile = subproject.file("build.gradle")
  def kotlinBuildFile = subproject.file("build.gradle.kts")
  // Modern libraries (react-native-worklets, react-native-reanimated) declare
  // their CMake build in build.gradle.kts, so check both file types.
  def declaresCmake =
    (buildFile.exists() && buildFile.text.contains("externalNativeBuild")) ||
    (kotlinBuildFile.exists() && kotlinBuildFile.text.contains("externalNativeBuild"))
  def hasCMakeLists =
    subproject.file("CMakeLists.txt").exists() ||
    subproject.file("src/main/cpp/CMakeLists.txt").exists()
  // :app gets its CMake path from the React Native plugin, not from
  // build.gradle, so always include it.
  def needsCmake = subproject.path == ":app" || declaresCmake || hasCMakeLists
  if (needsCmake) {
    def configureStaging = {
      def androidExt = subproject.extensions.findByName("android")
      if (androidExt != null) {
        androidExt.externalNativeBuild.cmake.buildStagingDirectory =
          new File("${root}/\${subproject.name}")
      }
    }
    if (!subproject.state.executed) {
      subproject.plugins.withId("com.android.application") { configureStaging() }
      subproject.plugins.withId("com.android.library") { configureStaging() }
    }

    def configureArguments = {
      def androidExt = subproject.extensions.findByName("android")
      if (androidExt != null) {
        def cmake = androidExt.defaultConfig.externalNativeBuild.cmake
        if (!cmake.arguments.contains("-DCMAKE_OBJECT_PATH_MAX=250")) {
          cmake.arguments.add("-DCMAKE_OBJECT_PATH_MAX=250")
        }
      }
    }
    if (subproject.state.executed) {
      configureArguments()
    } else {
      subproject.afterEvaluate { configureArguments() }
    }
  }
}
`;
}

module.exports = function withWindowsCmakePaths(config) {
  if (process.platform !== "win32") return config;

  const stagingRoot = path.join(os.homedir(), ".iti-cxx");

  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") return cfg;
    const contents = cfg.modResults.contents;
    if (contents.includes(MARKER)) return cfg;

    const block = gradleBlock(stagingRoot);
    const anchor = 'apply plugin: "expo-root-project"';

    cfg.modResults.contents = contents.includes(anchor)
      ? contents.replace(anchor, `${block}\n${anchor}`)
      : `${contents}\n${block}`;

    return cfg;
  });
};
