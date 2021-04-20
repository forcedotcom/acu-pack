acu-pack
========

SFDX CLI Extensions by Acumen Solutions Inc.

[![Version](https://img.shields.io/npm/v/acu-pack.svg)](https://www.npmjs.com/package/@acumensolutions/acu-pack)
[![Downloads/week](https://img.shields.io/npm/dw/acu-pack.svg)](https://www.npmjs.com/package/@acumensolutions/acu-pack)
[![License](https://img.shields.io/npm/l/acu-pack.svg)](https://bitbucket.org/acumensolutions/acu-pack/src/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
* [Usage](#usage)
* [Issues](#issues)
* [Commands](#commands)
<!-- tocstop -->

# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `acumen:apex:coverage` command: 
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:coverage:clear -u ORG_ALIAS
```

Some common debug commands:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run acumen:admin:user:unmask -u ORG_ALIAS -l test.user@trail.com.trail
$ NODE_OPTIONS=--inspect-brk bin/run acumen:admin:user:unmask -u ORG_ALIAS -f ./unmask-options.json
$ NODE_OPTIONS=--inspect-brk bin/run acumen:admin:workspace:delete -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acumen:admin:workspace:delete -u ORG_ALIAS -l test.user@trail.com.trail
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:coverage:clear -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:coverage:execute -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:coverage:report -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:scaffold -u ORG_ALIAS -s Account
$ NODE_OPTIONS=--inspect-brk bin/run acumen:apex:scaffold -u ORG_ALIAS -o scaffold-options.json
$ NODE_OPTIONS=--inspect-brk bin/run acumen:api:get -u ORG_ALIAS -m Account -i INSTANCE_ID
$ NODE_OPTIONS=--inspect-brk bin/run acumen:api:get -u ORG_ALIAS -m ContentVersion.VersionData -i INSTANCE_ID -o MyOrg-{Id}.pdf
$ NODE_OPTIONS=--inspect-brk bin/run acumen:package:build -u ORG_ALIAS -o package-options.json 
$ NODE_OPTIONS=--inspect-brk bin/run acumen:package:build -u ORG_ALIAS -s true 
$ NODE_OPTIONS=--inspect-brk bin/run acumen:package:merge -s ./test/commands/merge/package-a.xml -d ./test/commands/merge/package-b.xml
$ NODE_OPTIONS=--inspect-brk bin/run acumen:package:permissions -u ORG_ALIAS -x manifest/package-profile.xml
$ NODE_OPTIONS=--inspect-brk bin/run acumen:schema:dictionary -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acumen:schema:profile:retrieve -u ORG_ALIAS -n Admin
$ NODE_OPTIONS=--inspect-brk bin/run acumen:source:permissions -p force-app
$ NODE_OPTIONS=--inspect-brk bin/run acumen:source:profile -u ORG_ALIAS -m true -o test
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
If you are contributing to this repo - you can just link the plugin to SFDX CLI:
```
$ sfdx plugins:link
```
Otherwise install the plug-in:
```
$ sfdx plugins:install https://[YOUR_BITBUCKET_USER]@bitbucket.org/acumensolutions/acu-pack.git
```
Verify link/install:
```
$ sfdx acumen -h
```
NOTE: [Installing unsigned plugins automatically](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm#sfdx_setup_allowlist)

# Issues
## MAC
After installing acu-pack you may receive an error when attempting to run an acu-pack command for the first time. 
The error will likely resemble the following:
```sh-session
/usr/local/bin/sfdx: line 33: cd: HOME not set
```

Edit the file(s) indicated and update the line indicated in the error message from:
```sh-session
32	DIR=$(get_script_dir)
33	CLI_HOME=$(cd && pwd)
34	XDG_DATA_HOME="${XDG_DATA_HOME:="$CLI_HOME/.local/share"}"
```

to include a tilda (~) as follows:

```sh-session
32	DIR=$(get_script_dir)
33	CLI_HOME=$(cd ~ && pwd)
34	XDG_DATA_HOME="${XDG_DATA_HOME:="$CLI_HOME/.local/share"}"
```
# Commands
<!-- commands -->
* [`sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenadminuserunmask--l-string--f-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenadminworkspacedelete--l-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoverageclear--m-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoverageexecute--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoveragereport--r-string--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexscaffold--s-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapiget--m-string--i-string--o-string--t--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagebuild--x-string--m-string--o-string--n-string--s--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:merge -s <filepath> -d <filepath> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagemerge--s-filepath--d-filepath---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagepermissions--x-string--m-string--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenschemadictionary--r-string--n-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenschemaprofileretrieve--n-array--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltagit--s-filepath--g-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:md5 -s <filepath> [-m <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltamd5--s-filepath--m-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcepermissions--p-string--r-string--f-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourceprofile--p-string--m--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcexpath--o-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is refreshed.

```
Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is refreshed.

USAGE
  $ sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --userfile=userfile                                                           A file which contains a list of
                                                                                    usernames for the User objects to
                                                                                    update.

  -l, --userlist=userlist                                                           A comma delimited list of usernames
                                                                                    for the User objects to update.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx admin:user:unmask -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
       Removes the .invalid extension from the email address associated to the list of specified users in the specified 
  Org.
  $ sfdx admin:user:unmask -u myOrgAlias -f qa-users.txt
       Removes the .invalid extension from the email address associated to the list of users in the specified file in 
  the specified Org.
```

## `sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Deletes the Developer Console IDEWorkspace object for the specified user(s).

```
Deletes the Developer Console IDEWorkspace object for the specified user(s).

USAGE
  $ sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -l, --userlist=userlist                                                           A comma delimited list of usernames
                                                                                    to reset workspaces for.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx admin:workspace:delete -u myOrgAlias
       Deletes the Developer Console IDEWorkspace objects for the specified target username (-u).
  $ sfdx admin:workspace:delete -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
       Deletes the Developer Console IDEWorkspace objects for the specified list of users (-l).
```

## `sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Clears the Apex Code Coverage data from the specified Org.

```
Clears the Apex Code Coverage data from the specified Org.

USAGE
  $ sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --metadatas=metadatas                                                         An optional comma separated list of
                                                                                    metadata to include. The defaults
                                                                                    are: (ApexCodeCoverageAggregate.)

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:apex:coverage:clear -u myOrgAlias
       Deletes the existing instances of ApexCodeCoverageAggregate from the specific Org.
```

## `sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Executes Apex tests and includes Code Coverage metrics.

```
Executes Apex tests and includes Code Coverage metrics.

USAGE
  $ sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   The optional wait time (minutes) for
                                                                                    test execution to complete. A value
                                                                                    of -1 means infinite wait. A value
                                                                                    of 0 means no wait. The default is
                                                                                    -1

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics. The command block until all tests have 
  completed.
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 30
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test 
  completion.
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 0
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and returns immediately.
```

## `sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Pull Code Coverage metrics and generates a report.

```
Pull Code Coverage metrics and generates a report.

USAGE
  $ sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -r, --report=report                                                               The optional path for the generated
                                                                                    report.
                                                                                    CodeCoverageReport-{ORG}.xlsx

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   The optional wait time (minutes) for
                                                                                    test execution to complete. A value
                                                                                    of -1 means infinite wait. A value
                                                                                    of 0 means no wait. The default is
                                                                                    -1

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:apex:coverage:report -u myOrgAlias -r myCodeCoverageReport.xlsx
       Pulls the Code Coverage metrics from myOrgAlias and generates a CodeCoverageReport-myOrgAlias.xlsx report.
```

## `sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generates Apex test classes (and cls-meta files) for specified CustomObjects.

```
Generates Apex test classes (and cls-meta files) for specified CustomObjects.

USAGE
  $ sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -o, --options=options                                                             A file containing the Apex Test
                                                                                    scaffold options. Specifying this
                                                                                    option will create the file if it
                                                                                    doesn't exist already.

  -s, --sobjects=sobjects                                                           A comma separated list of SObject
                                                                                    types generate Apex Test classes
                                                                                    for. This list overrides any
                                                                                    SObjects list in the options file.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:apex:scaffold -u myOrgAlias -s Account,MyObject__c'
       Generates AccountTest.cls & MyObjectTest.cls Apex test classes (and cls-meta files) for the Account & MyObject__c 
  SObject types. Random values assigned to required fields by default
  $ sfdx acumen:apex:scaffold -u myOrgAlias -o scaffold-options.json
       Generates Apex test classes (and cls-meta files) for specified CustomObjects. The specified options file is used.
```

## `sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Performs the GET REST action against the specified URL/URI.

```
Performs the GET REST action against the specified URL/URI.

USAGE
  $ sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --ids=ids                                                                     (required) A comma delimited list of
                                                                                    Ids to get. A file will be written
                                                                                    for each Id provided

  -m, --metadata=metadata                                                           (required) The metadata to execute
                                                                                    the API against. The dot operator
                                                                                    can be used to retrieve a specific
                                                                                    field (i.e.
                                                                                    ContentVersion.VersionData)

  -o, --output=output                                                               OPTIONAL: The output folder path for
                                                                                    the files. The current directory is
                                                                                    the default.

  -t, --tooling                                                                     Set to true to specify the Tooling
                                                                                    API.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:api:get -u myOrgAlias -m Account -i 068r0000003slVtAAI
       Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes 
  the body to 068r0000003slVtAAI.json.
  $ sfdx acumen:api:get -u myOrgAlias -t true -m Account -i 068r0000003slVtAAI -o ./output/files/{Id}.json
       Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes 
  the body to ./output/files/068r0000003slVtAAI.json.
  $ sfdx acumen:api:get -u myOrgAlias -m ContentVersion.VersionData -i 068r0000003slVtAAI -o ./output/files/{Id}.pdf
       Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and 
  writes the VersionData field value body to 068r0000003slVtAAI.pdf.
       NOTE: Not all metadata types support field data access.
```

## `sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Builds a standard SFDX source format package file from the specified org's existing metadata.

```
Builds a standard SFDX source format package file from the specified org's existing metadata.

USAGE
  $ sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion 
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

  -s, --source                                                                      Set this flag to 'true' to use
                                                                                    Salesforce's Source Tracking data as
                                                                                    the contents for the package file.

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
Merges one SFDX package file into another.

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
Retrieve all metadata related to Profile security/access permissions.

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
Generates a DataDictionary-[Org].xlsx file from an Org's Object & Field metadata.

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

## `sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Retrives Profiles from Org without need to generate package.xml

```
Retrives Profiles from Org without need to generate package.xml

USAGE
  $ sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --names=names                                                                 (required) Comma seperated profile
                                                                                    names with out any extension.Example
                                                                                    "Admin,Agent". 5 Profiles can be
                                                                                    retrieved at a time

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE

       $ sfdx acumen:schema:profile:retrieve -u myOrgAlias -n "Admin,Support"
       Retrieves 5 profiles at a time. Default Path - force-app/main/default/profile
```

## `sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

```
Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

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
Uses an MD5 hash file to detect deltas.

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
Generate a security report based on configured permissions.
The accuracy of this report is dependant on the configuration in the local project.
It is suggested that a permissions package be created using the acumen:package:permissions
command and that package is retrieved from the org prior to executing this command.

USAGE
  $ sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folders=folders
      OPTIONAL: A comma separated list of folders to include. This list overrides the defaults: 
      **/objects/*/*.object-meta.xml, **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, 
      **/profiles/*.profile-meta.xml.

  -p, --source=source
      OPTIONAL: The source folder to start the meta scan from. Overrides the project's default package directory folder.

  -r, --report=report
      OPTIONAL: The path for the permissions report XLSX file. This overrides the default: PermissionsReport.xlsx.

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

DESCRIPTION
  The accuracy of this report is dependant on the configuration in the local project.
  It is suggested that a permissions package be created using the acumen:package:permissions
  command and that package is retrieved from the org prior to executing this command.

EXAMPLE
  $ sfdx acumen:source:permissions -u myOrgAlias
       Reads security information from source-formatted configuration files (**/objects/*/*.object-meta.xml, 
  **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, **/profiles/*.profile-meta.xml) 
  located in default project source location and writes the 'PermissionsReport.xlsx' report file.
```

## `sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Determines the compatibility for one or more profiles metadat data files with a specified Org

```
Determines the compatibility for one or more profiles metadat data files with a specified Org

USAGE
  $ sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --modify
      OPTIONAL: Setting this flag to true will updated the existing metadat to remove the incompatibile entries.

  -o, --output=output
      OPTIONAL: The output folder path for the modified profile metadata files. The existing files are overwritten if not 
      specififed.

  -p, --source=source
      OPTIONAL: Comma separated path to the Profile and/or PermissionsSet  metadata to evaluate. This overrides the 
      defaults: **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml.

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx acumen:source:profile -u myOrgAlias
       Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to detemrine deployment compatibility.
  $ sfdx acumen:source:profile -m true -u myOrgAlias
       Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to detemrine deployment compatibility.
```

## `sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Validates XML against xpath selects and known bad values.

```
Validates XML against xpath selects and known bad values.

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
* [`sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenadminuserunmask--l-string--f-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenadminworkspacedelete--l-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoverageclear--m-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoverageexecute--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoveragereport--r-string--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexscaffold--s-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapiget--m-string--i-string--o-string--t--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagebuild--x-string--m-string--o-string--n-string--s--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:merge -s <filepath> -d <filepath> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagemerge--s-filepath--d-filepath---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagepermissions--x-string--m-string--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenschemadictionary--r-string--n-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenschemaprofileretrieve--n-array--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltagit--s-filepath--g-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:md5 -s <filepath> [-m <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltamd5--s-filepath--m-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcepermissions--p-string--r-string--f-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourceprofile--p-string--m--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcexpath--o-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is refreshed.

```
Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is refreshed.

USAGE
  $ sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --userfile=userfile                                                           A file which contains a list of
                                                                                    usernames for the User objects to
                                                                                    update.

  -l, --userlist=userlist                                                           A comma delimited list of usernames
                                                                                    for the User objects to update.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx admin:user:unmask -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
       Removes the .invalid extension from the email address associated to the list of specified users in the specified 
  Org.
  $ sfdx admin:user:unmask -u myOrgAlias -f qa-users.txt
       Removes the .invalid extension from the email address associated to the list of users in the specified file in 
  the specified Org.
```

## `sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Deletes the Developer Console IDEWorkspace object for the specified user(s).

```
Deletes the Developer Console IDEWorkspace object for the specified user(s).

USAGE
  $ sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -l, --userlist=userlist                                                           A comma delimited list of usernames
                                                                                    to reset workspaces for.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx admin:workspace:delete -u myOrgAlias
       Deletes the Developer Console IDEWorkspace objects for the specified target username (-u).
  $ sfdx admin:workspace:delete -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
       Deletes the Developer Console IDEWorkspace objects for the specified list of users (-l).
```

## `sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Clears the Apex Code Coverage data from the specified Org.

```
Clears the Apex Code Coverage data from the specified Org.

USAGE
  $ sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --metadatas=metadatas                                                         An optional comma separated list of
                                                                                    metadata to include. The defaults
                                                                                    are: (ApexCodeCoverageAggregate.)

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:apex:coverage:clear -u myOrgAlias
       Deletes the existing instances of ApexCodeCoverageAggregate from the specific Org.
```

## `sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Executes Apex tests and includes Code Coverage metrics.

```
Executes Apex tests and includes Code Coverage metrics.

USAGE
  $ sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   The optional wait time (minutes) for
                                                                                    test execution to complete. A value
                                                                                    of -1 means infinite wait. A value
                                                                                    of 0 means no wait. The default is
                                                                                    -1

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics. The command block until all tests have 
  completed.
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 30
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test 
  completion.
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 0
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and returns immediately.
```

## `sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Pull Code Coverage metrics and generates a report.

```
Pull Code Coverage metrics and generates a report.

USAGE
  $ sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -r, --report=report                                                               The optional path for the generated
                                                                                    report.
                                                                                    CodeCoverageReport-{ORG}.xlsx

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   The optional wait time (minutes) for
                                                                                    test execution to complete. A value
                                                                                    of -1 means infinite wait. A value
                                                                                    of 0 means no wait. The default is
                                                                                    -1

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:apex:coverage:report -u myOrgAlias -r myCodeCoverageReport.xlsx
       Pulls the Code Coverage metrics from myOrgAlias and generates a CodeCoverageReport-myOrgAlias.xlsx report.
```

## `sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generates Apex test classes (and cls-meta files) for specified CustomObjects.

```
Generates Apex test classes (and cls-meta files) for specified CustomObjects.

USAGE
  $ sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -o, --options=options                                                             A file containing the Apex Test
                                                                                    scaffold options. Specifying this
                                                                                    option will create the file if it
                                                                                    doesn't exist already.

  -s, --sobjects=sobjects                                                           A comma separated list of SObject
                                                                                    types generate Apex Test classes
                                                                                    for. This list overrides any
                                                                                    SObjects list in the options file.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:apex:scaffold -u myOrgAlias -s Account,MyObject__c'
       Generates AccountTest.cls & MyObjectTest.cls Apex test classes (and cls-meta files) for the Account & MyObject__c 
  SObject types. Random values assigned to required fields by default
  $ sfdx acumen:apex:scaffold -u myOrgAlias -o scaffold-options.json
       Generates Apex test classes (and cls-meta files) for specified CustomObjects. The specified options file is used.
```

## `sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Performs the GET REST action against the specified URL/URI.

```
Performs the GET REST action against the specified URL/URI.

USAGE
  $ sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --ids=ids                                                                     (required) A comma delimited list of
                                                                                    Ids to get. A file will be written
                                                                                    for each Id provided

  -m, --metadata=metadata                                                           (required) The metadata to execute
                                                                                    the API against. The dot operator
                                                                                    can be used to retrieve a specific
                                                                                    field (i.e.
                                                                                    ContentVersion.VersionData)

  -o, --output=output                                                               OPTIONAL: The output folder path for
                                                                                    the files. The current directory is
                                                                                    the default.

  -t, --tooling                                                                     Set to true to specify the Tooling
                                                                                    API.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:api:get -u myOrgAlias -m Account -i 068r0000003slVtAAI
       Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes 
  the body to 068r0000003slVtAAI.json.
  $ sfdx acumen:api:get -u myOrgAlias -t true -m Account -i 068r0000003slVtAAI -o ./output/files/{Id}.json
       Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes 
  the body to ./output/files/068r0000003slVtAAI.json.
  $ sfdx acumen:api:get -u myOrgAlias -m ContentVersion.VersionData -i 068r0000003slVtAAI -o ./output/files/{Id}.pdf
       Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and 
  writes the VersionData field value body to 068r0000003slVtAAI.pdf.
       NOTE: Not all metadata types support field data access.
```

## `sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Builds a standard SFDX source format package file from the specified org's existing metadata.

```
Builds a standard SFDX source format package file from the specified org's existing metadata.

USAGE
  $ sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion 
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

  -s, --source                                                                      Set this flag to 'true' to use
                                                                                    Salesforce's Source Tracking data as
                                                                                    the contents for the package file.

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
Merges one SFDX package file into another.

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
Retrieve all metadata related to Profile security/access permissions.

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
Generates a DataDictionary-[Org].xlsx file from an Org's Object & Field metadata.

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

## `sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Retrives Profiles from Org without need to generate package.xml

```
Retrives Profiles from Org without need to generate package.xml

USAGE
  $ sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --names=names                                                                 (required) Comma seperated profile
                                                                                    names with out any extension.Example
                                                                                    "Admin,Agent". 5 Profiles can be
                                                                                    retrieved at a time

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE

       $ sfdx acumen:schema:profile:retrieve -u myOrgAlias -n "Admin,Support"
       Retrieves 5 profiles at a time. Default Path - force-app/main/default/profile
```

## `sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

```
Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

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
Uses an MD5 hash file to detect deltas.

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
Generate a security report based on configured permissions.
The accuracy of this report is dependant on the configuration in the local project.
It is suggested that a permissions package be created using the acumen:package:permissions
command and that package is retrieved from the org prior to executing this command.

USAGE
  $ sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folders=folders
      OPTIONAL: A comma separated list of folders to include. This list overrides the defaults: 
      **/objects/*/*.object-meta.xml, **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, 
      **/profiles/*.profile-meta.xml.

  -p, --source=source
      OPTIONAL: The source folder to start the meta scan from. Overrides the project's default package directory folder.

  -r, --report=report
      OPTIONAL: The path for the permissions report XLSX file. This overrides the default: PermissionsReport.xlsx.

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

DESCRIPTION
  The accuracy of this report is dependant on the configuration in the local project.
  It is suggested that a permissions package be created using the acumen:package:permissions
  command and that package is retrieved from the org prior to executing this command.

EXAMPLE
  $ sfdx acumen:source:permissions -u myOrgAlias
       Reads security information from source-formatted configuration files (**/objects/*/*.object-meta.xml, 
  **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, **/profiles/*.profile-meta.xml) 
  located in default project source location and writes the 'PermissionsReport.xlsx' report file.
```

## `sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Determines the compatibility for one or more profiles metadat data files with a specified Org

```
Determines the compatibility for one or more profiles metadat data files with a specified Org

USAGE
  $ sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --modify
      OPTIONAL: Setting this flag to true will updated the existing metadat to remove the incompatibile entries.

  -o, --output=output
      OPTIONAL: The output folder path for the modified profile metadata files. The existing files are overwritten if not 
      specififed.

  -p, --source=source
      OPTIONAL: Comma separated path to the Profile and/or PermissionsSet  metadata to evaluate. This overrides the 
      defaults: **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml.

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx acumen:source:profile -u myOrgAlias
       Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to detemrine deployment compatibility.
  $ sfdx acumen:source:profile -m true -u myOrgAlias
       Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to detemrine deployment compatibility.
```

## `sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Validates XML against xpath selects and known bad values.

```
Validates XML against xpath selects and known bad values.

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
* [`sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenadminuserunmask--l-string--f-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenadminworkspacedelete--l-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoverageclear--m-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoverageexecute--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexcoveragereport--r-string--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapexscaffold--s-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenapiget--m-string--i-string--o-string--t--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagebuild--x-string--m-string--o-string--n-string--s--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:merge -s <filepath> -d <filepath> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagemerge--s-filepath--d-filepath---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenpackagepermissions--x-string--m-string--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenschemadictionary--r-string--n-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumenschemaprofileretrieve--n-array--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltagit--s-filepath--g-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:delta:md5 -s <filepath> [-m <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcedeltamd5--s-filepath--m-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcepermissions--p-string--r-string--f-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourceprofile--p-string--m--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acumensourcexpath--o-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is refreshed.

```
Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is refreshed.

USAGE
  $ sfdx acumen:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --userfile=userfile                                                           A file which contains a list of
                                                                                    usernames for the User objects to
                                                                                    update.

  -l, --userlist=userlist                                                           A comma delimited list of usernames
                                                                                    for the User objects to update.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx admin:user:unmask -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
       Removes the .invalid extension from the email address associated to the list of specified users in the specified 
  Org.
  $ sfdx admin:user:unmask -u myOrgAlias -f qa-users.txt
       Removes the .invalid extension from the email address associated to the list of users in the specified file in 
  the specified Org.
```

## `sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Deletes the Developer Console IDEWorkspace object for the specified user(s).

```
Deletes the Developer Console IDEWorkspace object for the specified user(s).

USAGE
  $ sfdx acumen:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -l, --userlist=userlist                                                           A comma delimited list of usernames
                                                                                    to reset workspaces for.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx admin:workspace:delete -u myOrgAlias
       Deletes the Developer Console IDEWorkspace objects for the specified target username (-u).
  $ sfdx admin:workspace:delete -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
       Deletes the Developer Console IDEWorkspace objects for the specified list of users (-l).
```

## `sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Clears the Apex Code Coverage data from the specified Org.

```
Clears the Apex Code Coverage data from the specified Org.

USAGE
  $ sfdx acumen:apex:coverage:clear [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --metadatas=metadatas                                                         An optional comma separated list of
                                                                                    metadata to include. The defaults
                                                                                    are: (ApexCodeCoverageAggregate.)

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:apex:coverage:clear -u myOrgAlias
       Deletes the existing instances of ApexCodeCoverageAggregate from the specific Org.
```

## `sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Executes Apex tests and includes Code Coverage metrics.

```
Executes Apex tests and includes Code Coverage metrics.

USAGE
  $ sfdx acumen:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   The optional wait time (minutes) for
                                                                                    test execution to complete. A value
                                                                                    of -1 means infinite wait. A value
                                                                                    of 0 means no wait. The default is
                                                                                    -1

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics. The command block until all tests have 
  completed.
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 30
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test 
  completion.
  $ sfdx acumen:apex:coverage:execute -u myOrgAlias -w 0
       Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and returns immediately.
```

## `sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Pull Code Coverage metrics and generates a report.

```
Pull Code Coverage metrics and generates a report.

USAGE
  $ sfdx acumen:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -r, --report=report                                                               The optional path for the generated
                                                                                    report.
                                                                                    CodeCoverageReport-{ORG}.xlsx

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   The optional wait time (minutes) for
                                                                                    test execution to complete. A value
                                                                                    of -1 means infinite wait. A value
                                                                                    of 0 means no wait. The default is
                                                                                    -1

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx acumen:apex:coverage:report -u myOrgAlias -r myCodeCoverageReport.xlsx
       Pulls the Code Coverage metrics from myOrgAlias and generates a CodeCoverageReport-myOrgAlias.xlsx report.
```

## `sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generates Apex test classes (and cls-meta files) for specified CustomObjects.

```
Generates Apex test classes (and cls-meta files) for specified CustomObjects.

USAGE
  $ sfdx acumen:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -o, --options=options                                                             A file containing the Apex Test
                                                                                    scaffold options. Specifying this
                                                                                    option will create the file if it
                                                                                    doesn't exist already.

  -s, --sobjects=sobjects                                                           A comma separated list of SObject
                                                                                    types generate Apex Test classes
                                                                                    for. This list overrides any
                                                                                    SObjects list in the options file.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:apex:scaffold -u myOrgAlias -s Account,MyObject__c'
       Generates AccountTest.cls & MyObjectTest.cls Apex test classes (and cls-meta files) for the Account & MyObject__c 
  SObject types. Random values assigned to required fields by default
  $ sfdx acumen:apex:scaffold -u myOrgAlias -o scaffold-options.json
       Generates Apex test classes (and cls-meta files) for specified CustomObjects. The specified options file is used.
```

## `sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Performs the GET REST action against the specified URL/URI.

```
Performs the GET REST action against the specified URL/URI.

USAGE
  $ sfdx acumen:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --ids=ids                                                                     (required) A comma delimited list of
                                                                                    Ids to get. A file will be written
                                                                                    for each Id provided

  -m, --metadata=metadata                                                           (required) The metadata to execute
                                                                                    the API against. The dot operator
                                                                                    can be used to retrieve a specific
                                                                                    field (i.e.
                                                                                    ContentVersion.VersionData)

  -o, --output=output                                                               OPTIONAL: The output folder path for
                                                                                    the files. The current directory is
                                                                                    the default.

  -t, --tooling                                                                     Set to true to specify the Tooling
                                                                                    API.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx acumen:api:get -u myOrgAlias -m Account -i 068r0000003slVtAAI
       Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes 
  the body to 068r0000003slVtAAI.json.
  $ sfdx acumen:api:get -u myOrgAlias -t true -m Account -i 068r0000003slVtAAI -o ./output/files/{Id}.json
       Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes 
  the body to ./output/files/068r0000003slVtAAI.json.
  $ sfdx acumen:api:get -u myOrgAlias -m ContentVersion.VersionData -i 068r0000003slVtAAI -o ./output/files/{Id}.pdf
       Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and 
  writes the VersionData field value body to 068r0000003slVtAAI.pdf.
       NOTE: Not all metadata types support field data access.
```

## `sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Builds a standard SFDX source format package file from the specified org's existing metadata.

```
Builds a standard SFDX source format package file from the specified org's existing metadata.

USAGE
  $ sfdx acumen:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-u <string>] [--apiversion 
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

  -s, --source                                                                      Set this flag to 'true' to use
                                                                                    Salesforce's Source Tracking data as
                                                                                    the contents for the package file.

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
Merges one SFDX package file into another.

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
Retrieve all metadata related to Profile security/access permissions.

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
Generates a DataDictionary-[Org].xlsx file from an Org's Object & Field metadata.

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

## `sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Retrives Profiles from Org without need to generate package.xml

```
Retrives Profiles from Org without need to generate package.xml

USAGE
  $ sfdx acumen:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --names=names                                                                 (required) Comma seperated profile
                                                                                    names with out any extension.Example
                                                                                    "Admin,Agent". 5 Profiles can be
                                                                                    retrieved at a time

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE

       $ sfdx acumen:schema:profile:retrieve -u myOrgAlias -n "Admin,Support"
       Retrieves 5 profiles at a time. Default Path - force-app/main/default/profile
```

## `sfdx acumen:source:delta:git -s <filepath> [-g <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

```
Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

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
Uses an MD5 hash file to detect deltas.

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
Generate a security report based on configured permissions.
The accuracy of this report is dependant on the configuration in the local project.
It is suggested that a permissions package be created using the acumen:package:permissions
command and that package is retrieved from the org prior to executing this command.

USAGE
  $ sfdx acumen:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folders=folders
      OPTIONAL: A comma separated list of folders to include. This list overrides the defaults: 
      **/objects/*/*.object-meta.xml, **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, 
      **/profiles/*.profile-meta.xml.

  -p, --source=source
      OPTIONAL: The source folder to start the meta scan from. Overrides the project's default package directory folder.

  -r, --report=report
      OPTIONAL: The path for the permissions report XLSX file. This overrides the default: PermissionsReport.xlsx.

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

DESCRIPTION
  The accuracy of this report is dependant on the configuration in the local project.
  It is suggested that a permissions package be created using the acumen:package:permissions
  command and that package is retrieved from the org prior to executing this command.

EXAMPLE
  $ sfdx acumen:source:permissions -u myOrgAlias
       Reads security information from source-formatted configuration files (**/objects/*/*.object-meta.xml, 
  **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, **/profiles/*.profile-meta.xml) 
  located in default project source location and writes the 'PermissionsReport.xlsx' report file.
```

## `sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Determines the compatibility for one or more profiles metadat data files with a specified Org

```
Determines the compatibility for one or more profiles metadat data files with a specified Org

USAGE
  $ sfdx acumen:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --modify
      OPTIONAL: Setting this flag to true will updated the existing metadat to remove the incompatibile entries.

  -o, --output=output
      OPTIONAL: The output folder path for the modified profile metadata files. The existing files are overwritten if not 
      specififed.

  -p, --source=source
      OPTIONAL: Comma separated path to the Profile and/or PermissionsSet  metadata to evaluate. This overrides the 
      defaults: **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml.

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx acumen:source:profile -u myOrgAlias
       Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to detemrine deployment compatibility.
  $ sfdx acumen:source:profile -m true -u myOrgAlias
       Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to detemrine deployment compatibility.
```

## `sfdx acumen:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Validates XML against xpath selects and known bad values.

```
Validates XML against xpath selects and known bad values.

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
