
string bonsPath = @"C:\Users\rabed\OneDrive\Desktop\Schule\SYP\Leofee\backend\Core\Api\bons.txt";
string personsPath = @"C:\Users\rabed\OneDrive\Desktop\Schule\SYP\Leofee\backend\Core\Api\personal.txt";
string stdId = "1179206322";
var a = ImportData.DataController.importStudents(personsPath);
var b = ImportData.DataController.importBons(bonsPath);
var u = ImportData.Controller.getBonsForStudent(stdId, b, a);
;