acu-pack
========

SFDX CLI Extensions by Acumen Solutions Inc.

[![Version](https://img.shields.io/npm/v/acu-pack.svg)](https://www.npmjs.com/package/@acumensolutions/acu-pack)
[![Downloads/week](https://img.shields.io/npm/dw/acu-pack.svg)](https://www.npmjs.com/package/@acumensolutions/acu-pack)
[![License](https://img.shields.io/npm/l/acu-pack.svg)](https://bitbucket.org/acumensolutions/acu-pack/src/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `acumen:apex:coverage` command: 
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:coverage -u ACUDEV
```

Some common debug commands:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:coverage -u ACUDEV
$ NODE_OPTIONS=--inspect-brk bin/run acumen:package:build -o package-options.json -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acumen:package:merge -s ./test/commands/merge/package-a.xml -d ./test/commands/merge/package-b.xml
$ NODE_OPTIONS=--inspect-brk bin/run acumen:package:permissions -u ORG_ALIAS -x manifest/package-profile.xml
$ NODE_OPTIONS=--inspect-brk bin/run acumen:schema:dictionary -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acumen:source:permissions -p force-app
$ NODE_OPTIONS=--inspect-brk bin/run acumen:source:delta:md5 -m test/md5.test.txt -s test/force-app -d test/deploy
$ NODE_OPTIONS=--inspect-brk bin/run acumen:source:delta:git -g test/git.test.txt -s test/force-app -d test/deploy
$ NODE_OPTIONS=--inspect-brk bin/run acumen:source:xpath -o xpath-options.json
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
![Debug image](.images/vscodeScreenshot.png){width=480 height=278}
Congrats, you are debugging!

# Usage
```
$ sfdx plugins:install https://[YOUR_BITBUCKET_USER]@bitbucket.org/acumensolutions/acu-pack.git
$ sfdx acumen -h
```

# Commands
<!-- commands -->
* [`sfdx acumen:apex:coverage [-r <string>] [-s] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoverage--r-string--s--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagebuild--x-string--m-string--o-string--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:merge -s <filepath> -d <filepath> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagemerge--s-filepath--d-filepath---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagepermissions--x-string--m-string--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenschemadictionary--r-string--n-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltagit--s-filepath--g-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:md5 -s <filepath> [-m <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltamd5--s-filepath--m-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcepermissions--p-string--r-string--f-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcexpath--o-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx acumen:apex:coverage [-r <string>] [-s] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Optionally runs Apex Test classes and generates a code coverage report.

```
USAGE
  $ sfdx acumen:apex:coverage [-r <string>] [-s] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -r, --report=report                                                               The path for the code coverage
                                                                                    report XLSX file. This overrides the
                                                                                    default:
                                                                                    CodeCoverageReport-{ORG}.xlsx.

  -s, --skiptests                                                                   Optional - Set to true to skip test
                                                                                    execution. The default is false.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   The maximum wait time (minutes) for
                                                                                    test execution to complete. A value
                                                                                    of -1 means infinite wait. This flag
                                                                                    is ignored if Apex Test execution is
                                                                                    skipped.

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:apex:coverage -u myOrgAlias -r myCodeCoverageReport.xlsx
       Runs Apex Tests in myOrgAlias and generates a myCodeCoverageReport.xlsx coverage report.
  $ sfdx acumen:apex:coverage -u myOrgAlias -r myCodeCoverageReport.xlsx -s true
       Skips running Apex Tests in myOrgAlias and generates a myCodeCoverageReport.xlsx coverage report.
```

## `sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Builds a standard SFDX source format package file from the specified org's existing metadata.

```
USAGE
  $ sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --metadata=metadata                                                           A comma separated list of metadata
                                                                                    to include. This list overrides any
                                                                                    exclude list in the options file.

  -n, --namespaces=namespaces                                                       A comma separated list of namespaces
                                                                                    to include when retrieveing
                                                                                    metadata. By default namespaces are
                                                                                    excluded.

  -o, --options=options                                                             A file containing the package build
                                                                                    options. Specifying this option will
                                                                                    create the file if it doesn't exist
                                                                                    already.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -x, --package=package                                                             The path to the package file to be
                                                                                    generated. By default the path is
                                                                                    'package.xml'

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:package:build -o options/package-options.json -x manifest/package-acu.xml -u myOrgAlias
       Builds a SFDX package file (./manifest/package.xml) which contains all the metadata from the myOrgAlias.
       The options defined (options/package-options.json) are honored when building the package.
```

## `sfdx acumen:package:merge -s <filepath> -d <filepath> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Merges one SFDX package file into another.

```
USAGE
  $ sfdx acumen:package:merge -s <filepath> -d <filepath> [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --destination=destination                                                     (required) The destination SFDX
                                                                                    package which contains the merge
                                                                                    results. It will be created if it
                                                                                    does not exist.

  -s, --source=source                                                               (required) The source SFDX package.
                                                                                    This package wins all conflict
                                                                                    battles!

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:package:merge -s manifest/package.xml -d manifest/package-sprint17.xml
       Merges package.xml into package-sprint17.xml
```

## `sfdx acumen:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Retrieve all metadata related to Profile security/access permissions.

```
USAGE
  $ sfdx acumen:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] 
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --metadata=metadata
      A comma separated list of the metadata types to include. This overrides the default list: ApexClass, ApexPage, 
      CustomApplication, CustomObject, CustomTab, PermissionSet, Profile.

  -n, --namespaces=namespaces
      A comma separated list of namespaces to include when retrieveing metadata. By default namespaces are excluded.

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  -x, --package=package
      The path to the package file to be generated. By default the path is 'package-permissions.xml'

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx acumen:package:permissions -u myOrgAlias
       Creates a package file (package-permissions.xml) which contains
       Profile & PermissionSet metadata related to ApexClass, ApexPage, CustomApplication, CustomObject, CustomTab, 
  PermissionSet, Profile permissions.
  $ sfdx acumen:package:permissions -u myOrgAlias -m CustomObject,CustomApplication
       Creates a package file (package-permissions.xml) which contains
       Profile & PermissionSet metadata related to CustomObject & CustomApplication permissions.
```

## `sfdx acumen:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generates a DataDictionary-[Org].xlsx file from an Org's Object & Field metadata.

```
USAGE
  $ sfdx acumen:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] 
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --namespaces=namespaces                                                       A comma separated list of namespaces
                                                                                    to include when retrieveing
                                                                                    metadata. By default namespaces are
                                                                                    excluded.

  -o, --options=options                                                             A file containing the Data
                                                                                    Dictionary options. Specifying this
                                                                                    option will create the file if it
                                                                                    doesn't exist already.

  -r, --report=report                                                               The path for the data dictionary
                                                                                    report XLSX file. This overrides the
                                                                                    default: DataDictionary-{ORG}.xlsx.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:schema:dictionary -u myOrgAlias
       Generates a DataDictionary-myOrgAlias.xlsx file from an Org's configured Object & Field metadata.
```

## `sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

```
USAGE
  $ sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r 
  <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --check                                                                       Does a dry-run of a deployment.
                                                                                    Inspect the log file for results.
                                                                                    NOTE: This option is ignored if no
                                                                                    (d)estination option is provided.

  -d, --destination=destination                                                     The destination folder for the
                                                                                    deltas.

  -f, --force=force                                                                 Path to a file containing folders &
                                                                                    files to include in the delta
                                                                                    destination. Will override md5/git
                                                                                    AND ignore file contents.

  -g, --git=git                                                                     The output of a git-diff command
                                                                                    (https://git-scm.com/docs/git-diff)

  -i, --ignore=ignore                                                               Path to a file containing folders &
                                                                                    files to ignore. Will override
                                                                                    md5/git file contents.

  -r, --deletereport=deletereport                                                   Path to a file to write deleted
                                                                                    files.

  -s, --source=source                                                               (required) The source folder to
                                                                                    start the delta scan from.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:source:delta:git -g git.txt -s force-app -d deploy
       Reads the specified -(g)it diff file 'git.txt' and uses it to identify the deltas in
       -(s)ource 'force-app' and copies them to -(d)estination 'deploy'
```

## `sfdx acumen:source:delta:md5 -s <filepath> [-m <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Uses an MD5 hash file to detect deltas.

```
USAGE
  $ sfdx acumen:source:delta:md5 -s <filepath> [-m <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r 
  <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --check                                                                       Does a dry-run of a deployment.
                                                                                    Inspect the log file for results.
                                                                                    NOTE: This option is ignored if no
                                                                                    (d)estination option is provided.

  -d, --destination=destination                                                     The destination folder for the
                                                                                    deltas.

  -f, --force=force                                                                 Path to a file containing folders &
                                                                                    files to include in the delta
                                                                                    destination. Will override md5/git
                                                                                    AND ignore file contents.

  -i, --ignore=ignore                                                               Path to a file containing folders &
                                                                                    files to ignore. Will override
                                                                                    md5/git file contents.

  -m, --md5=md5                                                                     The MD5 hash list file to use

  -r, --deletereport=deletereport                                                   Path to a file to write deleted
                                                                                    files.

  -s, --source=source                                                               (required) The source folder to
                                                                                    start the delta scan from.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:source:delta:md5 -m md5.txt -s force-app -d deploy
       Reads the specified -(m)d5 file 'md5.txt' and uses it to identify the deltas in
       -(s)ource 'force-app' and copies them to -(d)estination 'deploy'
```

## `sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generate a security report based on configured permissions.

```
USAGE
  $ sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folders=folders
      A comma separated list of folders to include. This list overrides the defaults: **/objects/*/*.object-meta.xml, 
      **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, **/profiles/*.profile-meta.xml.

  -p, --source=source
      The source folder to start the meta scan from. The default is 'force-app'.

  -r, --report=report
      The path for the permissions report XLSX file. This overrides the default: PermissionsReport.xlsx.

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

DESCRIPTION
  The accuracy of this report is dependant on the configuration in the local project.
  It is suggested that a permissions package be created using the acumen:package:permissions
  command and that package is retrieved from the org prior to executing this command.

EXAMPLE
  $ sfdx acumen:source:permissions -d security/report -u myOrgAlias
       Reads security information from source-formatted configuration files (**/objects/*/*.object-meta.xml, 
  **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, **/profiles/*.profile-meta.xml) 
  located in 'force-app' and writes the 'PermissionsReport.xlsx' report file.
```

## `sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Validates XML against xpath selects and known bad values.

```
USAGE
  $ sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -o, --options=options                                                             A file containing the XPathOptions
                                                                                    json. Specifying this option will
                                                                                    create the file if it doesn't exist
                                                                                    already.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:source:xpath -o ./xpathOptions.json"
       Validates the project source from the x-path rules specified in 'xpath-options.json'
```
<!-- commandsstop -->
