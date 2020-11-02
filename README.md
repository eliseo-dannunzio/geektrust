# geektrust

My Node.js solution to the GeekTrust family tree challenge

This Node solution is to create an interface that preloads the Lengaburu Royal Family Tree
and then allows the use of various commands to allow interaction within the family tree to
add and select information on family members.

INSTALLATION
-

To install this, just download this folder into a separate area and fire up node in conjunction with it
`node geektrust.js`

The family tree will load and then will then await input.

COMMANDS
-
Commands can be entered in lower case or upper case.

* `exit` - Exits the interface and returns you to Node
* `add_child <existing mother's name> <child's name> <gender>` - Adds a child to the mother. Gender is either `male` or `female`. An attempt to add a child to a father or a non-existent mother will result in an error.
* `add_spouse <existing family member's name> <child's name> <gender>` - Adds a spouse to an existing family member. Gender is either `male` or `female`. An attempt to add a spouse  to an already married family member or non-existent family member will result in an error.
* `get_relationship <family member's name> <relationship>` - Provides a list of family members who are of type `relationship` with respect to the existing family member. If no relationships can be found, `NONE` is returned. If a non-existing family member is used for `<family member's name>`, an error of `PERSON_NOT_FOUND` will be returned.
* `reset` - Resets the family tree to the initialized family tree upon first executing the program.
* `run_file <filename>` - loads extra information from a file to add to the current family tree information. Upon loading the file, the file is parsed and commands are executed with general responses with respect to their success of execution or display of results. See files `testfile-1.txt`, `testfile-2.txt`, `testfile-3.txt` and `testfile-4.txt` for examples.
* `help` - Displays a help screen.

RELATIONSHIPS
-
Available relationships that can be used in the `get_relationship` command:
* paternal-uncle
* paternal-aunt
* maternal-uncle
* maternal-aunt
* mother
* father
* son
* daughter
* siblings
* brother-in-law
* sister-in-law

CAVEATS AND ASSUMPTIONS
-
* It has been assumed that the Lengaburu family have a tradition of unique family names, and thus the program is coded to take this into consideration.
* It is assumed that a male-to-female marriage relationship exists, though the code has ben written to take this into consideration. In conjunction to this, the code assumes that a mother would have a spouse. The code has not been written to account for an "unwed mother", per se.
* Naming conventions for family members are case-sensitive. When names are entered, please ensure that the correct case is used. According to the current code, "Steven" would be considered different to "STEVEN" or "steven", and thus would be treated as separate family members.
