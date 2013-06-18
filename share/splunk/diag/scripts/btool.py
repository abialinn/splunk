#!/usr/bin/env python
# Copyright (C) 2013 Splunk Inc. All Rights Reserved.

""" btool.py

This is a wrapper for the btool executable which knows how to arrange to run
btool against a diag, and *should* be maintained so that we can just run the
script without having to know all the special tricks.

Eg, if you have a diag in the dir 'diag', and splunk in '/opt/splunk' you should
be able to do.

   # . /opt/splunk/bin/setSplunkEnv
   # diag/script/btool.py indexes list

or

   # diag/script/btool.py -s /opt/splunk indexes list
"""
import os
import sys
import shutil

debug = True

def usage():
    text = "usage: %s -s <path/to/splunk_home> [btool opts ...] <btool args...>\n" % sys.argv[0]
    text += "  or if run via spulnk cmd python, just: %s [btool opts ...] <btool args...>" % sys.argv[0]
    sys.exit(text)


if debug:
    sys.stderr.write("fired with args: %s\n" % sys.argv)

# If we didn't get given a SPLUNK_HOME, try to go find one
if not os.environ.has_key("SPLUNK_HOME"):
    if "-s" not in sys.argv:
        err = "No SPLUNK_HOME path provided.\n"
        sys.stderr.write(err)
        usage()
    else:
        splhome_flag_i = sys.argv.index("-s")
        if (splhome_flag_i+1) == len(sys.argv):
            usage()
        splunk_home = sys.argv[splhome_flag_i + 1]
        if not os.path.isdir(splunk_home):
            err = "Provided path %s doesn't seem to be a directory.\n"
            sys.stderr.write(err % splunk_home)
            usage()

    # rerun ourselves with splunk python
    script_absolute_path = os.path.abspath(sys.argv[0])
    command = os.path.join(splunk_home, "bin", "splunk") 
    args = [command, "cmd", "python", script_absolute_path] + sys.argv[1:]
    if debug:
        sys.stderr.write("execing ourselves.\n")
    os.execv(command, args)

# by this point, we're running with a splunk python


def prep_shpool(etc_sys, pool_dir):
    # Do this only once, it might be slow or break?
    prep_done_file = "diag_munged"
    work_marker = os.path.join(pool_dir, prep_done_file)
    if os.path.exists(work_marker):
        return

    pool_etc_sys = os.path.join(pool_dir, "etc", "system")
    # seems copytree has no 'clobber' option
    if os.path.exists(pool_etc_sys):
        os.rename(pool_etc_sys, pool_etc_sys + ".renamed")

    pool_etc = os.path.join(pool_dir, "etc")
    if not os.path.exists(pool_etc):
        os.mkdir(pool_etc)

    shutil.copytree(etc_sys, pool_etc_sys)

    # create marker
    f = open(work_marker, "w")
    f.close()


splunk_home = os.environ["SPLUNK_HOME"]
btool_path = os.path.join(splunk_home, "bin", "btool")
script_path = sys.argv[0]
# diag/script/btool.py -> diag/
diag_dir = os.path.dirname(os.path.dirname(script_path)) 

# may not exist, it's a search pool if it does
pool_dir = os.path.join(diag_dir, "search_pool")

btool_opts = sys.argv[1:]
# take our flag out of the args (if present)
if "-s" in btool_opts:
    splhome_flag_i = btool_opts.index("-s")
    if (splhome_flag_i+1) == len(btool_opts):
        usage()
    del btool_opts[splhome_flag_i]
    del btool_opts[splhome_flag_i]

# default to looking at diag/etc, unless user picked somewhere else?
if '--dir' in btool_opts:
    # if user specifies --dir, they must know what they're doing
    pass
else:
    diag_etc = ""
    if os.path.isdir(pool_dir):
        local_diag_etc = os.path.join(diag_dir, 'etc')
        prep_shpool(local_diag_etc, pool_dir)
        diag_etc = os.path.join(pool_dir, "etc")
    else:
        # normal diag
        diag_etc = os.path.join(diag_dir, 'etc')
    btool_opts.insert(0, '--dir=' + diag_etc)

if debug:
    sys.stderr.write("going to execv: %s, %s\n" % (btool_path, btool_opts))

# run btool!
os.execv(btool_path, [btool_path] + btool_opts)
