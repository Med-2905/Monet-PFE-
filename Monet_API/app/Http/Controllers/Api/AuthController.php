<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Patient;

class AuthController extends Controller
{
    //
    /*
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }
*/




    /*
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'regex:/^[0-9\+\-\(\)\s]+$/', 'min:10', 'max:20'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => UserRole::PATIENT->value,
        ]);*/


    ///** @var \Tymon\JWTAuth\JWTGuard $guard */
    /*
        $guard = auth('api');
        $token = $guard->login($user);

        return $this->respondWithToken($token);
    }*/




        
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:30'],

            // patient optional fields
            'address' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $result = DB::transaction(function () use ($data) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'role' => UserRole::PATIENT->value,
            ]);

            $patient = Patient::create([
                'user_id' => $user->id,
                'address' => $data['address'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
            ]);

            return [
                'user' => $user,
                'patient' => $patient,
            ];
        });

        return response()->json([
            'message' => 'Patient registered successfully',
            'user' => $result['user'],
            'patient' => $result['patient'],
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);


        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'username';

        $credentials = [
            $loginField => $request->login,
            'password' => $request->password,
        ];

        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth('api');

        if (! $token = $guard->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid email/username or password',
            ], 401);
        }

        return $this->respondWithToken($token);
    }





    public function me()
    {
        ///** @var \Tymon\JWTAuth\JWTGuard $guard */
        //$guard = auth('api');
        return response()->json(auth('api')->user());
    }

    public function logout()
    {

        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth('api');
        $guard->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }






    public function refresh()
    {
        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth('api');
        return $this->respondWithToken($guard->refresh());
    }







    protected function respondWithToken($token)
    {
        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth('api');
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $guard->factory()->getTTL() * 60,
            'user' => $guard->user()
        ]);
    }
}
