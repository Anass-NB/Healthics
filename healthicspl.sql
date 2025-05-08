-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2025 at 06:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `healthicspl`
--

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `document_date` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `hospital_name` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `upload_date` datetime(6) DEFAULT NULL,
  `category_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `description`, `doctor_name`, `document_date`, `file_name`, `file_path`, `file_size`, `file_type`, `hospital_name`, `last_modified_date`, `title`, `upload_date`, `category_id`, `user_id`) VALUES
(1, 'de', 'AHmed', '2025-05-08 15:16:55.000000', '6_360e73f6-3e94-408c-afe4-6650c8122eec.jpeg', '6/6_360e73f6-3e94-408c-afe4-6650c8122eec.jpeg', 147065, 'image/jpeg', 'ds', '2025-05-08 15:16:55.000000', 'Fahs1', '2025-05-08 15:16:55.000000', 2, 6),
(2, 'Deleniti hic volupta', 'Jack Guerrero', '2025-05-08 15:18:17.000000', '6_045adc30-9740-4474-a3f6-50498599d379.pdf', '6/6_045adc30-9740-4474-a3f6-50498599d379.pdf', 88665, 'application/pdf', 'Blaze Callahan', '2025-05-08 15:18:17.000000', 'Et qui nulla eos eve', '2025-05-08 15:18:17.000000', 3, 6),
(3, 'Ea ipsam excepturi d', 'Audra Kelly', '2025-05-08 15:36:13.000000', '8_1ab70d43-f96d-43f2-a042-749b7b9ae7e1.pdf', '8/8_1ab70d43-f96d-43f2-a042-749b7b9ae7e1.pdf', 256037, 'application/pdf', 'Lucy Bernard', '2025-05-08 15:36:13.000000', 'Quos quos amet nisi', '2025-05-08 15:36:13.000000', 2, 8),
(4, 'Nisi do in quia volu', 'Sara Salas', '2025-05-08 15:05:57.000000', '13_40a4e8ed-9581-4168-a270-afe31b56fb8e.pdf', '13/13_40a4e8ed-9581-4168-a270-afe31b56fb8e.pdf', 92914, 'application/pdf', 'Mara Gallegos', '2025-05-08 16:06:13.000000', 'Ta7alil', '2025-05-08 16:05:57.000000', 1, 13);

-- --------------------------------------------------------

--
-- Table structure for table `document_categories`
--

CREATE TABLE `document_categories` (
  `id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_categories`
--

INSERT INTO `document_categories` (`id`, `description`, `name`) VALUES
(1, 'Laboratory test results', 'Lab Results'),
(2, 'Medication prescriptions', 'Prescriptions'),
(3, 'Clinical visit notes', 'Doctor Notes'),
(4, 'X-rays, MRIs, CT scans, etc.', 'Imaging'),
(5, 'Immunization history', 'Vaccination Records'),
(6, 'Insurance documents and claims', 'Insurance'),
(7, 'Hospitalization records', 'Hospital Records'),
(8, 'Surgery reports and follow-ups', 'Surgical Records');

-- --------------------------------------------------------

--
-- Table structure for table `patient_profiles`
--

CREATE TABLE `patient_profiles` (
  `id` bigint(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `allergies` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `medical_history` varchar(255) DEFAULT NULL,
  `medications` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patient_profiles`
--

INSERT INTO `patient_profiles` (`id`, `address`, `allergies`, `date_of_birth`, `emergency_contact`, `first_name`, `last_name`, `medical_history`, `medications`, `phone_number`, `user_id`) VALUES
(1, '123 Main St, Anytown, USA', 'Penicillin', '1990-01-15', 'Jane Doe, 987-654-3210', 'John', 'Doe', 'No significant medical history', 'None', '123-456-7890', 5),
(2, 'Nisi consequat Pari', 'Autem in ipsum nost', '1973-04-24', 'Illo impedit deleni', 'Ahmed', 'Duffy', 'Hic et cum provident', 'Sint nisi eos quis ', '+1 (135) 233-5915', 6),
(3, 'Aliqua Corrupti qu', 'Perferendis doloremq', '2023-05-12', 'Eaque aut rerum sed ', 'Jolene', 'Green', 'Qui sequi consequatu', 'Dolore rerum ad lore', '+1 (173) 108-9693', 8),
(4, 'Modi vero quis liber', 'Natus rerum excepteu', '2002-04-28', 'Odit est inventore ', 'Erin', 'Campos', 'Exercitation tempori', 'Optio est minima m', 'fff', 13);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) NOT NULL,
  `name` enum('ROLE_PATIENT','ROLE_ADMIN') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ROLE_PATIENT'),
(2, 'ROLE_ADMIN');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `active` bit(1) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `active`, `email`, `password`, `username`) VALUES
(1, b'1', 'admin@healthics.com', '$2a$10$evQ3EV/Jeq.O7xkzIoRic.hk71GCjdPnwCAA.UzUkK7sykPJ3qhsa', 'admin'),
(2, b'1', 'patient1@example.com', '$2a$10$AEeRvtdlhtOdd8dkHADVQeFRolDZ7e0jRt4lUpsJG4ckVrZhjcvcS', 'patient1'),
(3, b'1', 'hartita@example.com', '$2a$10$B.yHCKWXX7ft0qd68fzT9eEDQ0/GQu8cg4V3xFxXehSorCEeeDMM6', 'Hartita'),
(4, b'1', 'anass@example.com', '$2a$10$GY2Xkl2YoFwN1xkJ5fHqguNrQubnKQVepGH3vNicb0k95/DWFiNYG', 'anass'),
(5, b'1', 'tomy@example.com', '$2a$10$IJlRsqmI67GqTkisPdvlp.Lton9SkX7Umg/2AMHTFdeoHs99CG4Bi', 'tomy'),
(6, b'1', 'ahmed@example.com', '$2a$10$anqa9m.j29UqtE9hF6ZlreXIbsLrvMM0c8a3begMrJzTUl4enxK8O', 'ahmed'),
(7, b'1', 'jawad@example.com', '$2a$10$jfjLduv9w.ycIRO0L8tj1O99ufjcMiFtTMVoBk/BOkUNJiHn0OxLi', 'jawad'),
(8, b'1', 'rachid@example.com', '$2a$10$0wU98r0tAcLUZm93D5tlOOli3XxpbFHfYar3.653xaCz7ZdJcWJ.q', 'rachid'),
(9, b'1', 'rachid1@example.com', '$2a$10$7NZCnnmQ7wEOjW.br.hljOgs4x3FonufGmhUwCCc./Hhm91eBqSMO', 'rachid1'),
(10, b'1', 'foo@example.com', '$2a$10$crhuRbKBLWbsbo9SMDn0TeR3M9NiCdjAZOSNpcBFdHTJFqmZ3OKHm', 'foo'),
(11, b'1', 'gomevikuf@mailinator.com', '$2a$10$Al560m9MJUgNxQT7UCVb0..SRRBGOTf21Jk6ZiD/jGneHPq34dSs6', 'hapykacut'),
(12, b'1', 'anassnb@gmail.com', '$2a$10$ZeyzqDkmVCPMMC2OkK8pOOBcCgpcap2sbuXU23WoauwPuUn2GYiGi', 'anassnb'),
(13, b'1', 'ritutidota@mailinator.com', '$2a$10$izZDAtoU29TeuPXMWR.EbeA6q9bMwfjRHSgPkHJhx7rDYXcRJJGCK', 'vyragakuly');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 2),
(2, 1),
(3, 1),
(4, 2),
(5, 1),
(6, 1),
(7, 2),
(8, 1),
(9, 1),
(10, 2),
(11, 1),
(12, 2),
(13, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK7dxqwmnshfyh28xnbgiui88cc` (`category_id`),
  ADD KEY `FKkxttj4tp5le2uth212lu49vny` (`user_id`);

--
-- Indexes for table `document_categories`
--
ALTER TABLE `document_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_22naemx2gvf78rvbmpp6bnvm8` (`name`);

--
-- Indexes for table `patient_profiles`
--
ALTER TABLE `patient_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_m1vq601k5agscsnei45j7bcv1` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `document_categories`
--
ALTER TABLE `document_categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `patient_profiles`
--
ALTER TABLE `patient_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `FK7dxqwmnshfyh28xnbgiui88cc` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`id`),
  ADD CONSTRAINT `FKkxttj4tp5le2uth212lu49vny` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `patient_profiles`
--
ALTER TABLE `patient_profiles`
  ADD CONSTRAINT `FK48bdvcabhgaa1bqphn9jijwn2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
