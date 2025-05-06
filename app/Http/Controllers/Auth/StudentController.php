<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StudentController extends Controller
{

    /**
     * Fetch student data from BUBT API.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyStudent(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|numeric',
            ]);

            $studentId = $validated['student_id'];
            $response  = Http::get('https://bubt.edu.bd/global_file/getData.php', [
                'id'   => $studentId,
                'type' => 'stdVerify',
            ]);

            // Check if the response is successful
            if ($response->successful()) {
                $data       = $response->json();
                $department = Department::firstOrCreate([
                    'bubt_program_id' => $data['sis_std_prgrm_id'],
                ], [
                    'name' => $data['sis_std_prgrm_sn']
                ]);

                $responseMessage = [
                    'student'         => [
                        'id'            => $data['sis_std_id'],
                        'name'          => $data['sis_std_name'],
                        'email'         => $data['sis_std_email'],
                        'department_id' => $department->id,
                        'gender'        => $data['sis_std_gender'],
                        'intake'        => $data['sis_std_intk'],
                        'avatar'        => $this->isValidBase64Image($data['gazo'])
                            ? $data['gazo']
                            : NULL,
                    ],
                    'all_departments' => Department::select('id', 'name')->get(),
                    'message'         => "Student data fetched successfully"
                ];
            } else {
                $responseMessage = [
                    'message' => "Failed to fetch student data",
                    'data'    => NULL
                ];
            }

            return response()->json($responseMessage);
        } catch (Exception $e) {
            return response()->json([
                'message' => "An error occurred: ".$e->getMessage(),
                'data'    => NULL
            ]);
        }
    }

    /**
     * Validate if the given string is a valid base64 image.
     *
     * @param  string  $base64String
     *
     * @return bool
     */
    function isValidBase64Image(string $base64String)
    {
        $base64String = preg_replace('#^data:image/\w+;base64,#i', '', $base64String);
        $base64String = trim($base64String);

        return ! ($base64String == NULL);
    }

}


