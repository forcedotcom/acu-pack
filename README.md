# acu-pack

SFDX CLI Extensions from Salesforce Customer Success Group (CSG)

[![Version](https://img.shields.io/npm/v/acu-pack.svg)](https://www.npmjs.com/package/acu-pack/acu-pack)
[![Downloads/week](https://img.shields.io/npm/dw/acu-pack.svg)](https://www.npmjs.com/package/acu-pack/acu-pack)
[![License](https://img.shields.io/npm/l/acu-pack.svg)](https://github.com/forcedotcom/acu-pack/blob/main/package.json)

<!-- toc -->
* [acu-pack](#acu-pack)
* [Debugging your plugin](#debugging-your-plugin)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Debugging your plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `acu-pack:apex:coverage` command:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:apex:coverage:clear -u ORG_ALIAS
```

Some common debug commands:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:admin:user:unmask -u ORG_ALIAS -l test.user@trail.com.trail
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:admin:user:unmask -u ORG_ALIAS -f ./unmask-options.json
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:admin:workspace:delete -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:admin:workspace:delete -u ORG_ALIAS -l test.user@trail.com.trail
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:apex:coverage:clear -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:apex:coverage:execute -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:apex:coverage:report -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:apex:scaffold -u ORG_ALIAS -s Account
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:apex:scaffold -u ORG_ALIAS -o scaffold-options.json
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:api:get -u ORG_ALIAS -m Account -i INSTANCE_ID
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:api:get -u ORG_ALIAS -m ContentVersion.VersionData -i INSTANCE_ID -o MyOrg-{Id}.pdf
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:package:build -u ORG_ALIAS -o package-options.json
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:package:build -u ORG_ALIAS -s -a
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:package:merge -s ./test/commands/merge/package-a.xml -d ./test/commands/merge/package-b.xml
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:package:permissions -u ORG_ALIAS -x manifest/package-profile.xml
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:schema:dictionary -u ORG_ALIAS
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:schema:profile:retrieve -u ORG_ALIAS -n Admin
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:source:permissions -p force-app
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:source:profile -u ORG_ALIAS -m -o test
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:source:delta:md5 -m test/md5.test.txt -s test/force-app -d test/deploy
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:source:delta:git -g test/git.test.txt -s test/force-app -d test/deploy
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:source:delta:git -o delta-options.json
$ NODE_OPTIONS=--inspect-brk bin/run acu-pack:source:xpath -o xpath-options.json
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
$ sfdx plugins:install https://[YOUR_REPO_USER]@github.com/CSGAMERSServices/acu-pack.git
```

Verify link/install:

```
$ sfdx acu-pack -h
```

NOTE: [Installing unsigned plugins automatically](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm#sfdx_setup_allowlist)

# Commands

<!-- commands -->
* [`sfdx acu-pack:admin:user:access [-l <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packadminuseraccess--l-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packadminuserunmask--l-string--f-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packadminworkspacedelete--l-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:apex:coverage:clear [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packapexcoverageclear--m-string--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packapexcoverageexecute--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packapexcoveragereport--r-string--w-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packapexscaffold--s-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packapiget--m-string--i-string--o-string--t--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packpackagebuild--x-string--m-string--o-string--n-string--s--a--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:package:merge -s <filepath> -d <filepath> [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packpackagemerge--s-filepath--d-filepath--c---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packpackagepermissions--x-string--m-string--n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packschemadictionary--r-string--n-string--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packschemaprofileretrieve--n-array--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:source:delta:git [-g <filepath>] [-o <filepath>] [-s <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [-a <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packsourcedeltagit--g-filepath--o-filepath--s-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c--a-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:source:delta:md5 [-m <filepath>] [-o <filepath>] [-s <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [-a <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packsourcedeltamd5--m-filepath--o-filepath--s-filepath--d-filepath--f-filepath--i-filepath--r-filepath--c--a-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packsourcepermissions--p-string--r-string--f-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packsourceprofile--p-string--m--o-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx acu-pack:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-acu-packsourcexpath--o-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx acu-pack:admin:user:access [-l <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generates a report which defines user access via PermissionSet to Salewsforce Apps.

```
USAGE
  $ sfdx acu-pack:admin:user:access [-l <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -l, --applist=applist                                                             A comma delimited list of Apps to
                                                                                    check access for.

  -r, --report=report                                                               The optional path for the generated
                                                                                    report. UserAccess-{ORG}.xlsx

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  Generates a report which defines user access via PermissionSet to Salewsforce Apps.

EXAMPLES
  $ sfdx admin:user:access -u myOrgAlias
      Creates a report UserAccess-myOrgAlias.xlsxon User access to all the Apps based on PermisionSets and Profiles.
  $ sfdx admin:user:access -u myOrgAlias -l 'Sales','Platform'
      Creates a report UserAccess-myOrgAlias.xlsxon User access to the specified Apps based on PermisionSets and 
  Profiles.
```

_See code: [compiled/commands/acu-pack/admin/user/access.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/admin/user/access.ts)_

## `sfdx acu-pack:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is refreshed.

```
USAGE
  $ sfdx acu-pack:admin:user:unmask [-l <string>] [-f <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

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

DESCRIPTION
  Removes the .invalid extension from a User's email address. This extenion is automatically added when a sandbox is 
  refreshed.

EXAMPLES
  $ sfdx admin:user:unmask -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
      Removes the .invalid extension from the email address associated to the list of specified users in the specified 
  Org.
  $ sfdx admin:user:unmask -u myOrgAlias -f qa-users.txt
      Removes the .invalid extension from the email address associated to the list of users in the specified file in the
   specified Org.
```

_See code: [compiled/commands/acu-pack/admin/user/unmask.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/admin/user/unmask.ts)_

## `sfdx acu-pack:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Deletes the Developer Console IDEWorkspace object for the specified user(s).

```
USAGE
  $ sfdx acu-pack:admin:workspace:delete [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
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

DESCRIPTION
  Deletes the Developer Console IDEWorkspace object for the specified user(s).

EXAMPLES
  $ sfdx admin:workspace:delete -u myOrgAlias
      Deletes the Developer Console IDEWorkspace objects for the specified target username (-u).
  $ sfdx admin:workspace:delete -u myOrgAlias -l 'user1@sf.com, user2@sf.com, user3@sf.com'
      Deletes the Developer Console IDEWorkspace objects for the specified list of users (-l).
```

_See code: [compiled/commands/acu-pack/admin/workspace/delete.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/admin/workspace/delete.ts)_

## `sfdx acu-pack:apex:coverage:clear [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Clears the Apex Code Coverage data from the specified Org.

```
USAGE
  $ sfdx acu-pack:apex:coverage:clear [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --metadatas=metadatas                                                         An optional comma separated list of
                                                                                    metadata to include. The defaults
                                                                                    are: (ApexCodeCoverageAggregate.)

  -n, --classortriggernames=classortriggernames                                     An optional comma seperated list of
                                                                                    class or trigger names to include

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  Clears the Apex Code Coverage data from the specified Org.

EXAMPLE
  $ sfdx acu-pack:apex:coverage:clear -u myOrgAlias
      Deletes the existing instances of ApexCodeCoverageAggregate from the specific Org.
```

_See code: [compiled/commands/acu-pack/apex/coverage/clear.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/apex/coverage/clear.ts)_

## `sfdx acu-pack:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Executes Apex tests and includes Code Coverage metrics.

```
USAGE
  $ sfdx acu-pack:apex:coverage:execute [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
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

DESCRIPTION
  Executes Apex tests and includes Code Coverage metrics.

EXAMPLES
  $ sfdx acu-pack:apex:coverage:execute -u myOrgAlias
      Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics. The command block until all tests have 
  completed.
  $ sfdx acu-pack:apex:coverage:execute -u myOrgAlias -w 30
      Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and waits up to 30 minutes for test 
  completion.
  $ sfdx acu-pack:apex:coverage:execute -u myOrgAlias -w 0
      Enqueues Apex Tests to be run in myOrgAlias with Code Coverage metrics and returns immediately.
```

_See code: [compiled/commands/acu-pack/apex/coverage/execute.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/apex/coverage/execute.ts)_

## `sfdx acu-pack:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Pull Code Coverage metrics and generates a report.

```
USAGE
  $ sfdx acu-pack:apex:coverage:report [-r <string>] [-w <integer>] [-u <string>] [--apiversion <string>] [--json] 
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

DESCRIPTION
  Pull Code Coverage metrics and generates a report.

EXAMPLE
  $ sfdx acu-pack:apex:coverage:report -u myOrgAlias -r myCodeCoverageReport.xlsx
      Pulls the Code Coverage metrics from myOrgAlias and generates a CodeCoverageReport-myOrgAlias.xlsx report.
```

_See code: [compiled/commands/acu-pack/apex/coverage/report.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/apex/coverage/report.ts)_

## `sfdx acu-pack:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generates Apex test classes (and cls-meta files) for specified CustomObjects.

```
USAGE
  $ sfdx acu-pack:apex:scaffold [-s <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
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

DESCRIPTION
  Generates Apex test classes (and cls-meta files) for specified CustomObjects.

EXAMPLES
  $ sfdx acu-pack:apex:scaffold -u myOrgAlias -s Account,MyObject__c'
      Generates AccountTest.cls & MyObjectTest.cls Apex test classes (and cls-meta files) for the Account & MyObject__c 
  SObject types. Random values assigned to required fields by default
  $ sfdx acu-pack:apex:scaffold -u myOrgAlias -o scaffold-options.json
      Generates Apex test classes (and cls-meta files) for specified CustomObjects. The specified options file is used.
```

_See code: [compiled/commands/acu-pack/apex/scaffold.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/apex/scaffold.ts)_

## `sfdx acu-pack:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Performs the GET REST action against the specified URL/URI.

```
USAGE
  $ sfdx acu-pack:api:get -m <string> -i <string> [-o <string>] [-t] [-u <string>] [--apiversion <string>] [--json] 
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

DESCRIPTION
  Performs the GET REST action against the specified URL/URI.

EXAMPLES
  $ sfdx acu-pack:api:get -u myOrgAlias -m Account -i 068r0000003slVtAAI
      Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes the
   body to 068r0000003slVtAAI.json.
  $ sfdx acu-pack:api:get -u myOrgAlias -t true -m Account -i 068r0000003slVtAAI -o ./output/files/{Id}.json
      Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes the
   body to ./output/files/068r0000003slVtAAI.json.
  $ sfdx acu-pack:api:get -u myOrgAlias -m ContentVersion.VersionData -i 068r0000003slVtAAI -o ./output/files/{Id}.pdf
      Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and 
  writes the VersionData field value body to 068r0000003slVtAAI.pdf.
      NOTE: Not all metadata types support field data access.
```

_See code: [compiled/commands/acu-pack/api/get.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/api/get.ts)_

## `sfdx acu-pack:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Builds a standard SFDX source format package file from the specified org's existing metadata.

```
USAGE
  $ sfdx acu-pack:package:build [-x <string>] [-m <string>] [-o <string>] [-n <string>] [-s] [-a] [-u <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --append                                                                      Set this flag to 'true' if you wish
                                                                                    to append to the existing
                                                                                    package.xml file. The default
                                                                                    (false) overwrites the existing
                                                                                    file.

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

DESCRIPTION
  Builds a standard SFDX source format package file from the specified org's existing metadata.

EXAMPLE
  $ sfdx acu-pack:package:build -o options/package-options.json -x manifest/package-acu.xml -u myOrgAlias
      Builds a SFDX package file (./manifest/package.xml) which contains all the metadata from the myOrgAlias.
      The options defined (options/package-options.json) are honored when building the package.
```

_See code: [compiled/commands/acu-pack/package/build.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/package/build.ts)_

## `sfdx acu-pack:package:merge -s <filepath> -d <filepath> [-c] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Merges one SFDX package file into another.

```
USAGE
  $ sfdx acu-pack:package:merge -s <filepath> -d <filepath> [-c] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --compare                                                                     Include this flag to compare the two
                                                                                    packages. Both packages will have
                                                                                    common items *removed*.

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

DESCRIPTION
  Merges one SFDX package file into another.

EXAMPLES
  $ sfdx acu-pack:package:merge -s manifest/package.xml -d manifest/package-sprint17.xml
      Merges package.xml into package-sprint17.xml
  $ sfdx acu-pack:package:merge -s manifest/package-a.xml -d manifest/package-b.xml -c
      Compares package-a.xml to package-b.xml and removes common elements from BOTH packages - leaving only the 
  differences.
```

_See code: [compiled/commands/acu-pack/package/merge.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/package/merge.ts)_

## `sfdx acu-pack:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Retrieve all metadata related to Profile security/access permissions.

```
USAGE
  $ sfdx acu-pack:package:permissions [-x <string>] [-m <string>] [-n <string>] [-u <string>] [--apiversion <string>] 
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -m, --metadata=metadata
      A comma separated list of the metadata types to include. This overrides the default list: ApexClass, ApexPage,
      CustomApplication, CustomObject, CustomField, CustomTab, PermissionSet, Profile, RecordType, Layout.

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

DESCRIPTION
  Retrieve all metadata related to Profile security/access permissions.

EXAMPLES
  $ sfdx acu-pack:package:permissions -u myOrgAlias
      Creates a package file (package-permissions.xml) which contains
      Profile & PermissionSet metadata related to ApexClass, ApexPage, CustomApplication, CustomObject, CustomField, 
  CustomTab, PermissionSet, Profile, RecordType, Layout permissions.
  $ sfdx acu-pack:package:permissions -u myOrgAlias -m CustomObject,CustomApplication
      Creates a package file (package-permissions.xml) which contains
      Profile & PermissionSet metadata related to CustomObject & CustomApplication permissions.
```

_See code: [compiled/commands/acu-pack/package/permissions.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/package/permissions.ts)_

## `sfdx acu-pack:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generates a DataDictionary-[Org].xlsx file from an Org's Object & Field metadata.

```
USAGE
  $ sfdx acu-pack:schema:dictionary [-r <string>] [-n <string>] [-o <string>] [-u <string>] [--apiversion <string>] 
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

DESCRIPTION
  Generates a DataDictionary-[Org].xlsx file from an Org's Object & Field metadata.

EXAMPLE
  $ sfdx acu-pack:schema:dictionary -u myOrgAlias
      Generates a DataDictionary-myOrgAlias.xlsx file from an Org's configured Object & Field metadata.
```

_See code: [compiled/commands/acu-pack/schema/dictionary.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/schema/dictionary.ts)_

## `sfdx acu-pack:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Retrives Profiles from Org without need to generate package.xml

```
USAGE
  $ sfdx acu-pack:schema:profile:retrieve -n <array> [-u <string>] [--apiversion <string>] [--json] [--loglevel 
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

DESCRIPTION
  Retrives Profiles from Org without need to generate package.xml

EXAMPLE

      $ sfdx acu-pack:schema:profile:retrieve -u myOrgAlias -n "Admin,Support"
      Retrieves 5 profiles at a time. Default Path - force-app/main/default/profile
```

_See code: [compiled/commands/acu-pack/schema/profile/retrieve.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/schema/profile/retrieve.ts)_

## `sfdx acu-pack:source:delta:git [-g <filepath>] [-o <filepath>] [-s <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [-a <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status --no-renames -w <target branch> > git-diff.txt

```
USAGE
  $ sfdx acu-pack:source:delta:git [-g <filepath>] [-o <filepath>] [-s <filepath>] [-d <filepath>] [-f <filepath>] [-i 
  <filepath>] [-r <filepath>] [-c] [-a <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --copyfulldir=copyfulldir                                                     Specifies a comma delimited list of
                                                                                    directories where all files should
                                                                                    be copied if one of the files
                                                                                    changed. The default list is:
                                                                                    aura,lwc,experiences

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

  -o, --options=options                                                             A file containing the delta command
                                                                                    options. Specifying this option will
                                                                                    create the file if it doesn't exist
                                                                                    already.

  -r, --deletereport=deletereport                                                   Path to a file to write deleted
                                                                                    files.

  -s, --source=source                                                               The source folder to start the delta
                                                                                    scan from.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  Uses a git-diff file to detect deltas. Generate a git-diff.txt diff file as follows: git --no-pager diff --name-status
   --no-renames -w <target branch> > git-diff.txt

EXAMPLE
  $ sfdx acu-pack:source:delta:git -g git.txt -s force-app -d deploy
      Reads the specified -(g)it diff file 'git.txt' and uses it to identify the deltas in
      -(s)ource 'force-app' and copies them to -(d)estination 'deploy'
```

_See code: [compiled/commands/acu-pack/source/delta/git.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/source/delta/git.ts)_

## `sfdx acu-pack:source:delta:md5 [-m <filepath>] [-o <filepath>] [-s <filepath>] [-d <filepath>] [-f <filepath>] [-i <filepath>] [-r <filepath>] [-c] [-a <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Uses an MD5 hash file to detect deltas.

```
USAGE
  $ sfdx acu-pack:source:delta:md5 [-m <filepath>] [-o <filepath>] [-s <filepath>] [-d <filepath>] [-f <filepath>] [-i 
  <filepath>] [-r <filepath>] [-c] [-a <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --copyfulldir=copyfulldir                                                     Specifies a comma delimited list of
                                                                                    directories where all files should
                                                                                    be copied if one of the files
                                                                                    changed. The default list is:
                                                                                    aura,lwc,experiences

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

  -o, --options=options                                                             A file containing the delta command
                                                                                    options. Specifying this option will
                                                                                    create the file if it doesn't exist
                                                                                    already.

  -r, --deletereport=deletereport                                                   Path to a file to write deleted
                                                                                    files.

  -s, --source=source                                                               The source folder to start the delta
                                                                                    scan from.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  Uses an MD5 hash file to detect deltas.

EXAMPLE
  $ sfdx acu-pack:source:delta:md5 -m md5.txt -s force-app -d deploy
      Reads the specified -(m)d5 file 'md5.txt' and uses it to identify the deltas in
      -(s)ource 'force-app' and copies them to -(d)estination 'deploy'
```

_See code: [compiled/commands/acu-pack/source/delta/md5.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/source/delta/md5.ts)_

## `sfdx acu-pack:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Generate a security report based on configured permissions.

```
USAGE
  $ sfdx acu-pack:source:permissions [-p <string>] [-r <string>] [-f <string>] [--json] [--loglevel 
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
  Generate a security report based on configured permissions.
  The accuracy of this report is dependant on the configuration in the local project.
  It is suggested that a permissions package be created using the acu-pack:package:permissions
  command and that package is retrieved from the org prior to executing this command.

EXAMPLE
  $ sfdx acu-pack:source:permissions -u myOrgAlias
      Reads security information from source-formatted configuration files (**/objects/*/*.object-meta.xml, 
  **/objects/*/fields/*.field-meta.xml, **/permissionsets/*.permissionset-meta.xml, **/profiles/*.profile-meta.xml) 
  located in default project source location and writes the 'PermissionsReport.xlsx' report file.
```

_See code: [compiled/commands/acu-pack/source/permissions.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/source/permissions.ts)_

## `sfdx acu-pack:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Determines the compatibility for one or more profiles metadata files with a specified Org. WARNING: This command should be executed by a user with full read permissions to all objects & fields.

```
USAGE
  $ sfdx acu-pack:source:profile [-p <string>] [-m] [-o <string>] [-u <string>] [--apiversion <string>] [--json] 
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

DESCRIPTION
  Determines the compatibility for one or more profiles metadata files with a specified Org. WARNING: This command 
  should be executed by a user with full read permissions to all objects & fields.

EXAMPLES
  $ sfdx acu-pack:source:profile -u myOrgAlias
      Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to detemrine deployment compatibility.
  $ sfdx acu-pack:source:profile -m true -u myOrgAlias
      Compares the profile metadata files in **/profiles/*.profile-meta.xml,**/permissionsets/*.permissionset-meta.xml 
  to the specified Org to and updates the metadat files to ensuredeployment compatibility.
```

_See code: [compiled/commands/acu-pack/source/profile.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/source/profile.ts)_

## `sfdx acu-pack:source:xpath [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Validates XML against xpath selects and known bad values.

```
USAGE
  $ sfdx acu-pack:source:xpath [-o <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -o, --options=options                                                             A file containing the XPathOptions
                                                                                    json. Specifying this option will
                                                                                    create the file if it doesn't exist
                                                                                    already.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  Validates XML against xpath selects and known bad values.

EXAMPLE
  $ sfdx acu-pack:source:xpath -o ./xpathOptions.json"
      Validates the project source from the x-path rules specified in 'xpath-options.json'
```

_See code: [compiled/commands/acu-pack/source/xpath.ts](https://github.com/forcedotcom/acu-pack/blob/v2.0.0/compiled/commands/acu-pack/source/xpath.ts)_
<!-- commandsstop -->
